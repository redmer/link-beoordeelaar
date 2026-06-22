import type { Container, OperationInput } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { readJsonBody } from "../http";
import { DatasetCreateReq, SubjectDoc } from "../types";

function dedupeSubjects(subjects: DatasetCreateReq["subjects"]) {
  const seen = new Set<string>();
  return subjects.filter((subject) => {
    if (!subject || typeof subject.url !== "string" || !subject.url.trim()) {
      return false;
    }
    const normalized = subject.url.trim();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

export async function datasetsCreate(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  let payload: DatasetCreateReq;
  try {
    payload = await readJsonBody<DatasetCreateReq>(request);
  } catch (error) {
    return { status: 400, body: (error as Error).message };
  }

  if (!payload.subjects || !Array.isArray(payload.subjects)) {
    return { status: 400, body: "subjects must be an array" };
  }

  const subjects = dedupeSubjects(payload.subjects);
  if (subjects.length === 0) {
    return {
      status: 400,
      body: "subjects must contain at least one valid url",
    };
  }

  const datasetId = crypto.randomUUID();
  const now = new Date().toISOString();

  let container: Container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  const items: SubjectDoc[] = subjects.map((subject) => ({
    id: crypto.randomUUID(),
    datasetId,
    url: subject.url.trim(),
    metadata: subject.metadata,
    answers: subject.answers ?? {},
    type: "subject",
    createdAt: now,
    updatedAt: now,
  }));

  // Cosmos DB transactional batch: up to 100 operations per call, all sharing
  // the same partition key (datasetId). 2 MB max payload per batch.
  const BATCH_SIZE = 100;
  try {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const operations: OperationInput[] = chunk.map((item) => ({
        operationType: "Create",
        resourceBody: { ...item },
      }));
      const response = await container.items.batch(operations, datasetId);
      if (response.code && response.code >= 400) {
        const failed = response.result?.find((r) => r.statusCode >= 400);
        throw new Error(
          `Batch insert failed (status ${response.code}): ${
            failed ? JSON.stringify(failed) : "unknown sub-operation error"
          }`,
        );
      }
    }
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Failed to write subjects to Cosmos DB." };
  }

  return {
    status: 201,
    jsonBody: {
      id: datasetId,
    },
  };
}

app.http("datasetsCreate", {
  methods: ["POST"],
  authLevel: "function",
  route: "datasets/create",
  handler: datasetsCreate,
});
