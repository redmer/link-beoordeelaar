import type { Container, JSONValue } from "@azure/cosmos";
import { SqlQuerySpec } from "@azure/cosmos";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getSubjectsContainer } from "../cosmos";
import { parseFilterParam } from "../http";
import { FilterExpression, FilterValue } from "../types";

const SAFE_KEY = /^[A-Za-z0-9_]+$/;

type BuildState = {
  index: number;
  parameters: { name: string; value: JSONValue }[];
};

function isFilterValue(value: unknown): value is FilterValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveFieldPath(field: string): string | null {
  const parts = field.split(".");
  if (parts.length === 1) {
    if (field === "id" || field === "url") {
      return `c.${field}`;
    }
    return null;
  }

  if (parts.length === 2) {
    const [root, key] = parts;
    if ((root === "metadata" || root === "answers") && SAFE_KEY.test(key)) {
      return `c.${root}.${key}`;
    }
  }

  return null;
}

function addParam(state: BuildState, value: FilterValue) {
  const name = `@f${state.index}`;
  state.index += 1;
  state.parameters.push({ name, value });
  return name;
}

function parseFilterExpression(value: unknown): FilterExpression | null {
  if (!isRecord(value)) {
    return null;
  }

  const keys = Object.keys(value);
  if (keys.length !== 1) {
    return null;
  }

  const key = keys[0];
  const content = value[key];

  if (key === "and" || key === "or" || key === "all" || key === "any") {
    if (!Array.isArray(content)) {
      return null;
    }
    const items = content
      .map(parseFilterExpression)
      .filter((item): item is FilterExpression => item !== null);
    if (items.length !== content.length || items.length === 0) {
      return null;
    }
    return { [key]: items } as FilterExpression;
  }

  if (key === "not") {
    const inner = parseFilterExpression(content);
    return inner ? { not: inner } : null;
  }

  if (key === "eq" || key === "contains" || key === "notContains") {
    if (!isRecord(content)) {
      return null;
    }
    const field = content.field;
    const valueNode = content.value;
    if (typeof field !== "string" || !isFilterValue(valueNode)) {
      return null;
    }
    return { [key]: { field, value: valueNode } } as FilterExpression;
  }

  return null;
}

function buildExpression(
  expr: FilterExpression,
  state: BuildState,
): string | null {
  if ("and" in expr || "all" in expr) {
    const items = "and" in expr ? expr.and : expr.all;
    const clauses = items
      .map((item) => buildExpression(item, state))
      .filter((item): item is string => item !== null);
    if (clauses.length !== items.length) {
      return null;
    }
    return `(${clauses.join(" AND ")})`;
  }

  if ("or" in expr || "any" in expr) {
    const items = "or" in expr ? expr.or : expr.any;
    const clauses = items
      .map((item) => buildExpression(item, state))
      .filter((item): item is string => item !== null);
    if (clauses.length !== items.length) {
      return null;
    }
    return `(${clauses.join(" OR ")})`;
  }

  if ("not" in expr) {
    const inner = buildExpression(expr.not, state);
    return inner ? `NOT ${inner}` : null;
  }

  if ("eq" in expr) {
    const fieldPath = resolveFieldPath(expr.eq.field);
    if (!fieldPath) {
      return null;
    }
    const paramName = addParam(state, expr.eq.value);
    return `${fieldPath} = ${paramName}`;
  }

  if ("contains" in expr) {
    const fieldPath = resolveFieldPath(expr.contains.field);
    if (!fieldPath) {
      return null;
    }
    const paramName = addParam(state, expr.contains.value);
    return `ARRAY_CONTAINS(${fieldPath}, ${paramName})`;
  }

  if ("notContains" in expr) {
    const fieldPath = resolveFieldPath(expr.notContains.field);
    if (!fieldPath) {
      return null;
    }
    const paramName = addParam(state, expr.notContains.value);
    return `NOT ARRAY_CONTAINS(${fieldPath}, ${paramName})`;
  }

  return null;
}

function buildFilter(filter: Record<string, unknown>) {
  const state: BuildState = { index: 0, parameters: [] };
  const advanced = parseFilterExpression(filter);

  if (advanced) {
    const clause = buildExpression(advanced, state);
    if (!clause) {
      return { error: "Invalid filter expression." } as const;
    }
    return { clause, parameters: state.parameters } as const;
  }

  return { error: "Invalid filter expression." } as const;
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

  const filteredWhere = filteredClauses.join(" AND ");
  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM c WHERE ${filteredWhere}`,
    parameters,
  };

  let container: Container;
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
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${filteredWhere}`,
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
