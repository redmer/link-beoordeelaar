import type { Container } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { readJsonBody } from "../http";
import { SubjectDoc, SubjectPatchReq } from "../types";

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

  if (!payload.answers || typeof payload.answers !== "object") {
    return { status: 400, body: "answers must be an object" };
  }

  let container: Container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  try {
    const { resource } = await container
      .item(subjectId, datasetId)
      .read<SubjectDoc>();
    if (!resource) {
      return { status: 404 };
    }

    const mergedAnswers = {
      ...(resource.answers ?? {}),
      ...payload.answers,
    };

    await container.item(subjectId, datasetId).patch([
      { op: "set", path: "/answers", value: mergedAnswers },
      { op: "set", path: "/updatedAt", value: new Date().toISOString() },
    ]);
  } catch (error) {
    const message = (error as { code?: number }).code;
    if (message === 404) {
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
