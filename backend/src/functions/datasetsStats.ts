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

  const scopeRaw = request.query.get("scope");
  const scope = parseFilterParam(scopeRaw);
  if (scopeRaw && !scope) {
    return { status: 400, body: "Invalid scope JSON." };
  }

  // We build two independent query specs, each with their own parameter
  // list, so the parameter indices produced by buildFilter() don't collide
  // when both `scope` and `filter` are supplied. Sharing one array (as the
  // previous version did) silently bound the second filter's parameters to
  // the first filter's parameter names, producing wrong counts whenever a
  // request carried both predicates.
  const baseClauses = ["c.datasetId = @datasetId", "c.type = 'subject'"];
  const baseParam = { name: "@datasetId", value: datasetId as JSONValue };

  // unjudged = subjects matching the full session filter (scope + still-todo).
  const unjudgedClauses = [...baseClauses];
  const unjudgedParameters: { name: string; value: JSONValue }[] = [baseParam];
  if (filter) {
    const extra = buildFilter(filter);
    if ("error" in extra) {
      return { status: 400, body: extra.error };
    }
    unjudgedClauses.push(extra.clause);
    unjudgedParameters.push(...extra.parameters);
  }

  // total = subjects matching the session's *scope*. Without a scope we
  // intentionally don't return a `total`: the dataset-wide count is not a
  // useful denominator for a scoped session (it would make the progress bar
  // measure "fraction of dataset outside this queue" rather than "fraction
  // judged within this queue"). The frontend treats `total === null` as
  // "no progress bar".
  let totalQuery: SqlQuerySpec | null = null;
  if (scope) {
    const extra = buildFilter(scope);
    if ("error" in extra) {
      return { status: 400, body: extra.error };
    }
    const totalClauses = [...baseClauses, extra.clause];
    totalQuery = {
      query: `SELECT VALUE COUNT(1) FROM c WHERE ${totalClauses.join(" AND ")}`,
      parameters: [baseParam, ...extra.parameters],
    };
  }

  let container: Container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  const unjudgedQuery: SqlQuerySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${unjudgedClauses.join(" AND ")}`,
    parameters: unjudgedParameters,
  };

  const [total, unjudged] = await Promise.all([
    totalQuery ? countSubjects(container, totalQuery) : Promise.resolve(null),
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
