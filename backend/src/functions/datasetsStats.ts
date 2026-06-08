import type { Container, JSONValue } from "@azure/cosmos";
import { SqlQuerySpec } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { buildFilter } from "../filter";
import { parseFilterParam } from "../http";

async function countSubjects(container: Container, query: SqlQuerySpec) {
  const iterator = container.items.query<number>(query);
  const { resources } = await iterator.fetchNext();
  return resources?.[0] ?? 0;
}

export async function datasetsStats(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const datasetId = request.params.dataset;
  if (!datasetId) {
    return { status: 400, body: "Missing dataset id." };
  }

  const filterRaw = request.query.get("filter");
  const filter = parseFilterParam(filterRaw);
  if (filterRaw && !filter) {
    return { status: 400, body: "Invalid filter JSON." };
  }

  const baseClauses = ["c.datasetId = @datasetId", "c.type = 'subject'"];
  const parameters: { name: string; value: JSONValue }[] = [
    { name: "@datasetId", value: datasetId },
  ];
  const filteredClauses = [...baseClauses];

  if (filter) {
    const extra = buildFilter(filter);
    if ("error" in extra) {
      return { status: 400, body: extra.error };
    }
    filteredClauses.push(extra.clause);
    parameters.push(...extra.parameters);
  }

  let container: Container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  const filteredWhere = filteredClauses.join(" AND ");
  const totalQuery: SqlQuerySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${baseClauses.join(" AND ")}`,
    parameters,
  };
  const unjudgedQuery: SqlQuerySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${filteredWhere}`,
    parameters,
  };

  const [total, unjudged] = await Promise.all([
    countSubjects(container, totalQuery),
    countSubjects(container, unjudgedQuery),
  ]);

  return {
    status: 200,
    jsonBody: {
      total,
      unjudged,
    },
  };
}

app.http("datasetsStats", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "datasets/{dataset}/stats",
  handler: datasetsStats,
});
