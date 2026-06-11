import type { JSONValue } from "@azure/cosmos";
import { FilterExpression, FilterValue } from "./types";

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

  if (key === "and" || key === "or") {
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

  if (key === "eq" || key === "contains") {
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

  if (key === "exists") {
    if (!isRecord(content)) {
      return null;
    }
    const field = content.field;
    if (typeof field !== "string") {
      return null;
    }
    return { exists: { field } };
  }

  return null;
}

function buildExpression(
  expr: FilterExpression,
  state: BuildState,
): string | null {
  if ("and" in expr) {
    const items = expr.and;
    const clauses = items
      .map((item) => buildExpression(item, state))
      .filter((item): item is string => item !== null);
    if (clauses.length !== items.length) {
      return null;
    }
    return `(${clauses.join(" AND ")})`;
  }

  if ("or" in expr) {
    const items = expr.or;
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
    return inner ? `NOT (${inner})` : null;
  }

  if ("eq" in expr) {
    const fieldPath = resolveFieldPath(expr.eq.field);
    if (!fieldPath) {
      return null;
    }
    const paramName = addParam(state, expr.eq.value);
    // Guard with IS_DEFINED so that comparing a missing property yields a
    // well-defined boolean instead of `undefined`. This makes `NOT eq(...)`
    // behave intuitively: it matches documents where the field is missing
    // OR where it has a different value.
    return `(IS_DEFINED(${fieldPath}) AND ${fieldPath} = ${paramName})`;
  }

  if ("exists" in expr) {
    const fieldPath = resolveFieldPath(expr.exists.field);
    if (!fieldPath) {
      return null;
    }
    return `IS_DEFINED(${fieldPath})`;
  }

  if ("contains" in expr) {
    const fieldPath = resolveFieldPath(expr.contains.field);
    if (!fieldPath) {
      return null;
    }
    const paramName = addParam(state, expr.contains.value);
    return `IS_DEFINED(${fieldPath}) AND ARRAY_CONTAINS(${fieldPath}, ${paramName})`;
  }

  return null;
}

export function buildFilter(filter: Record<string, unknown>) {
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
