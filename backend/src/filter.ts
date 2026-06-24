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

function addParam(state: BuildState, value: JSONValue) {
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

  if (key === "in") {
    if (!isRecord(content)) {
      return null;
    }
    const field = content.field;
    const values = content.values;
    if (typeof field !== "string" || !Array.isArray(values)) {
      return null;
    }
    // Reject empty lists: their semantics are confusing (always-false?
    // always-true?) and almost always indicate a frontend bug. Callers can
    // express "match nothing" more clearly if they ever need to.
    if (values.length === 0) {
      return null;
    }
    if (!values.every(isFilterValue)) {
      return null;
    }
    return { in: { field, values } };
  }

  if (key === "between") {
    if (!isRecord(content)) {
      return null;
    }
    const field = content.field;
    if (typeof field !== "string") {
      return null;
    }
    const hasMin = "min" in content && content.min !== undefined;
    const hasMax = "max" in content && content.max !== undefined;
    if (!hasMin && !hasMax) {
      // An open-on-both-ends `between` is just `exists`. Reject it so
      // callers don't accidentally construct a no-op clause that they
      // *think* is restrictive.
      return null;
    }
    if (hasMin && !isFilterValue(content.min)) {
      return null;
    }
    if (hasMax && !isFilterValue(content.max)) {
      return null;
    }
    const out: { field: string; min?: FilterValue; max?: FilterValue } = {
      field,
    };
    if (hasMin) {
      out.min = content.min as FilterValue;
    }
    if (hasMax) {
      out.max = content.max as FilterValue;
    }
    return { between: out };
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
    // `contains` matches either:
    //   - a string field containing the substring (CONTAINS), or
    //   - an array field containing the value as an element (ARRAY_CONTAINS).
    // We guard each branch with the matching IS_* check so a wrong-typed
    // field doesn't blow up the whole expression. The outer parens keep
    // precedence sane when wrapped in NOT/AND/OR.
    return (
      `((IS_STRING(${fieldPath}) AND CONTAINS(${fieldPath}, ${paramName})) ` +
      `OR (IS_ARRAY(${fieldPath}) AND ARRAY_CONTAINS(${fieldPath}, ${paramName})))`
    );
  }

  if ("in" in expr) {
    const fieldPath = resolveFieldPath(expr.in.field);
    if (!fieldPath) {
      return null;
    }
    // The whole list travels as a single Cosmos parameter (a JSON array).
    // This is dramatically cheaper on the wire than the equivalent
    // OR-of-eq fan-out, and it stays well under Cosmos' 256-parameter
    // per-query cap regardless of list length.
    //
    // ARRAY_CONTAINS(values, x) returns false when `x` is undefined, so
    // `NOT in(...)` correctly matches documents where the field is missing
    // (consistent with how `eq` behaves under NOT).
    const paramName = addParam(state, expr.in.values as JSONValue);
    return `ARRAY_CONTAINS(${paramName}, ${fieldPath})`;
  }

  if ("between" in expr) {
    const fieldPath = resolveFieldPath(expr.between.field);
    if (!fieldPath) {
      return null;
    }
    // Guard with IS_DEFINED for the same reason `eq` does: comparisons
    // against an undefined property in Cosmos yield `undefined`, which
    // makes NOT-wrapping behave unintuitively. With the guard,
    // `NOT between(...)` matches missing-or-out-of-range, which is what
    // callers expect.
    const parts: string[] = [`IS_DEFINED(${fieldPath})`];
    if (expr.between.min !== undefined) {
      const p = addParam(state, expr.between.min);
      parts.push(`${fieldPath} >= ${p}`);
    }
    if (expr.between.max !== undefined) {
      const p = addParam(state, expr.between.max);
      parts.push(`${fieldPath} <= ${p}`);
    }
    return `(${parts.join(" AND ")})`;
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
