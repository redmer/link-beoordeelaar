import type { Container } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { SubjectDoc } from "../types";

export async function datasetsGetSubject(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const datasetId = request.params.dataset;
  const subjectId = request.params.subject_id;
  if (!datasetId || !subjectId) {
    return { status: 400, body: "Missing dataset or subject id." };
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

    return { status: 200, jsonBody: resource };
  } catch (error) {
    const message = (error as { code?: number }).code;
    if (message === 404) {
      return { status: 404 };
    }
    context.error(error);
    return { status: 500, body: "Failed to update subject." };
  }
}

app.http("datasetsGetSubject", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "datasets/{dataset}/subjects/{subject_id}",
  handler: datasetsGetSubject,
});
