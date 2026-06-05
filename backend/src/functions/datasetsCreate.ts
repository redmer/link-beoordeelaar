import type { Container } from "@azure/cosmos";
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
    answers: {},
    type: "subject",
    createdAt: now,
    updatedAt: now,
  }));

  for (const item of items) {
    await container.items.create(item);
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
