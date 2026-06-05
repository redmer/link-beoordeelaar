import { SqlQuerySpec } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { parseFilterParam } from "../http";

const SAFE_KEY = /^[A-Za-z0-9_]+$/;

function buildFilter(filter: Record<string, string | number | boolean | null>) {
  const clauses: string[] = [];
  const parameters: { name: string; value: unknown }[] = [];

  Object.entries(filter).forEach(([key, value], index) => {
    if (!SAFE_KEY.test(key)) {
      return;
    }

    const field =
      key === "id" || key === "url" ? `c.${key}` : `c.metadata.${key}`;
    const paramName = `@f${index}`;
    clauses.push(`${field} = ${paramName}`);
    parameters.push({ name: paramName, value });
  });

  return { clauses, parameters };
}

async function countSubjects(query: SqlQuerySpec) {
  const container = await getSubjectsContainer();
  const iterator = container.items.query<number>(query);
  const { resources } = await iterator.fetchNext();
  return resources?.[0] ?? 0;
}

export async function datasetsNextSubject(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const datasetId = request.params.dataset;
  if (!datasetId) {
    return { status: 400, body: "Missing dataset id." };
  }

  const filter = parseFilterParam(request.query.get("filter"));
  const baseClauses = ["c.datasetId = @datasetId", "c.type = 'subject'"];
  const parameters: { name: string; value: unknown }[] = [
    { name: "@datasetId", value: datasetId },
  ];

  if (filter) {
    const extra = buildFilter(filter);
    baseClauses.push(...extra.clauses);
    parameters.push(...extra.parameters);
  }

  const unjudgedWhere = [...baseClauses, "c.isJudged = false"].join(" AND ");
  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM c WHERE ${unjudgedWhere}`,
    parameters,
  };

  let container;
  try {
    container = await getSubjectsContainer();
  } catch (error) {
    context.error(error);
    return { status: 500, body: "Cosmos DB configuration is missing." };
  }

  const iterator = container.items.query(querySpec, { maxItemCount: 50 });
  const { resources } = await iterator.fetchNext();
  const candidates = resources ?? [];

  if (candidates.length === 0) {
    return { status: 404 };
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  const subject = candidates[randomIndex];

  const totalQuery: SqlQuerySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${baseClauses.join(" AND ")}`,
    parameters,
  };

  const unjudgedQuery: SqlQuerySpec = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${unjudgedWhere}`,
    parameters,
  };

  const [total, unjudged] = await Promise.all([
    countSubjects(totalQuery),
    countSubjects(unjudgedQuery),
  ]);

  return {
    status: 200,
    jsonBody: {
      subject,
      stats: {
        total,
        unjudged,
      },
    },
  };
}

app.http("datasetsNextSubject", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "datasets/{dataset}/next-subject",
  handler: datasetsNextSubject,
});
