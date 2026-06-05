import type { Container } from "@azure/cosmos";
import { SqlQuerySpec } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";

export async function datasetsDownload(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const datasetId = request.params.dataset;
  if (!datasetId) {
    return { status: 400, body: "Missing dataset id." };
  }

  let container: Container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM c WHERE c.datasetId = @datasetId AND c.type = 'subject'",
    parameters: [{ name: "@datasetId", value: datasetId }],
  };

  const iterator = container.items.query(querySpec);
  const { resources } = await iterator.fetchAll();

  if (!resources || resources.length === 0) {
    return { status: 404 };
  }

  return {
    status: 200,
    jsonBody: {
      id: datasetId,
      results: resources,
    },
  };
}

app.http("datasetsDownload", {
  methods: ["GET"],
  authLevel: "function",
  route: "datasets/{dataset}/download",
  handler: datasetsDownload,
});
