import type { Container, PatchOperation } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { readJsonBody } from "../http";
import { SubjectPatchReq } from "../types";

// Cosmos DB allows up to 10 operations per patch request.
const COSMOS_PATCH_OP_LIMIT = 10;

// Question ids are embedded in the JSON Pointer path of the patch operation,
// so they must not contain `/` or `~`. We restrict to the same character class
// already used elsewhere (see filter.ts) to keep the surface small.
const SAFE_QUESTION_ID = /^[A-Za-z0-9_]+$/;

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export async function subjectsPatchAnswers(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const datasetId = request.params.dataset;
  const subjectId = request.params.subject_id;
  if (!datasetId || !subjectId) {
    return { status: 400, body: "Missing dataset or subject id." };
  }

  let payload: SubjectPatchReq;
  try {
    payload = await readJsonBody<SubjectPatchReq>(request);
  } catch (error) {
    return { status: 400, body: (error as Error).message };
  }

  if (
    !payload.answers ||
    typeof payload.answers !== "object" ||
    Array.isArray(payload.answers)
  ) {
    return { status: 400, body: "answers must be an object" };
  }

  const entries = Object.entries(payload.answers);
  for (const [questionId, value] of entries) {
    if (!SAFE_QUESTION_ID.test(questionId)) {
      return {
        status: 400,
        body: `Invalid question id "${questionId}"; only alphanumerics and underscore are allowed.`,
      };
    }
    if (!isStringArray(value)) {
      return {
        status: 400,
        body: `answers.${questionId} must be an array of strings.`,
      };
    }
  }

  if (entries.length === 0) {
    // Nothing to merge; treat as a successful no-op.
    return { status: 202 };
  }

  let container: Container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  // Build one `set` op per question id. By targeting the sub-path
  // `/answers/<qid>` we let Cosmos apply each update atomically against the
  // current server state, so two concurrent PATCHes that touch different
  // question ids no longer overwrite each other (no more read-modify-write).
  // Submitting the same question id again still replaces its previous value,
  // matching the documented merge semantics in backend/README.md.
  const answerOps: PatchOperation[] = entries.map(([questionId, value]) => ({
    op: "set",
    path: `/answers/${questionId}`,
    value,
  }));

  // Chunk so each patch request stays within Cosmos' 10-op limit. The final
  // chunk also carries the `updatedAt` set; if the answer ops alone fill the
  // last chunk, we send `updatedAt` as a separate, trailing patch. Atomicity
  // is preserved per chunk — which is enough, because each individual answer
  // key is still updated atomically.
  const updatedAtOp: PatchOperation = {
    op: "set",
    path: "/updatedAt",
    value: new Date().toISOString(),
  };

  const chunks: PatchOperation[][] = [];
  for (let i = 0; i < answerOps.length; i += COSMOS_PATCH_OP_LIMIT) {
    chunks.push(answerOps.slice(i, i + COSMOS_PATCH_OP_LIMIT));
  }
  const lastChunk = chunks[chunks.length - 1];
  if (lastChunk.length < COSMOS_PATCH_OP_LIMIT) {
    lastChunk.push(updatedAtOp);
  } else {
    chunks.push([updatedAtOp]);
  }

  try {
    for (const ops of chunks) {
      await container.item(subjectId, datasetId).patch(ops);
    }
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 404) {
      return { status: 404 };
    }
    context.error(error);
    return { status: 500, body: "Failed to update subject." };
  }

  return { status: 202 };
}

app.http("subjectsPatchAnswers", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "datasets/{dataset}/subjects/{subject_id}/answers",
  handler: subjectsPatchAnswers,
});
