import pick from "./filtered-object.js";

describe("pick (filtered-object)", () => {
  it("should filter object properties based on allowed keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = pick(obj, ["a", "c"]);

    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("should return empty object when no keys are allowed", () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, []);

    expect(result).toEqual({});
  });

  it("should ignore non-existent allowed keys", () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, ["a", "c", "d"]);

    expect(result).toEqual({ a: 1 });
  });

  it("should preserve property values of different types", () => {
    const obj = {
      string: "hello",
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { nested: "value" },
    };
    const result = pick(obj, [
      "string",
      "number",
      "boolean",
      "null",
      "array",
      "object",
    ]);

    expect(result).toEqual(obj);
  });

  it("should handle objects containing undefined values", () => {
    const obj = { a: 1, b: undefined, c: 3 };
    const result = pick(obj, ["a", "b", "c"]);

    expect(result).toEqual({ a: 1, b: undefined, c: 3 });
  });

  it("should work with all string keys", () => {
    const obj = { name: "test", id: "123", active: true };
    const result = pick(obj, ["name", "active"]);

    expect(result).toEqual({ name: "test", active: true });
  });
});
