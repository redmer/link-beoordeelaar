import enumerate from "./enumerate.js";

describe("enumerate", () => {
  it("should enumerate array elements with indices starting at 0", () => {
    const arr = ["a", "b", "c"];
    const result = Array.from(enumerate(arr));

    expect(result).toEqual([
      [0, "a"],
      [1, "b"],
      [2, "c"],
    ]);
  });

  it("should support custom start index", () => {
    const arr = ["x", "y", "z"];
    const result = Array.from(enumerate(arr, 10));

    expect(result).toEqual([
      [10, "x"],
      [11, "y"],
      [12, "z"],
    ]);
  });

  it("should work with empty arrays", () => {
    const result = Array.from(enumerate([]));

    expect(result).toEqual([]);
  });

  it("should work with generators", () => {
    function* gen() {
      yield "first";
      yield "second";
      yield "third";
    }

    const result = Array.from(enumerate(gen()));

    expect(result).toEqual([
      [0, "first"],
      [1, "second"],
      [2, "third"],
    ]);
  });

  it("should work with strings (as iterables)", () => {
    const result = Array.from(enumerate("hello"));

    expect(result).toEqual([
      [0, "h"],
      [1, "e"],
      [2, "l"],
      [3, "l"],
      [4, "o"],
    ]);
  });

  it("should work with Set", () => {
    const set = new Set([10, 20, 30]);
    const result = Array.from(enumerate(set));

    expect(result).toHaveLength(3);
    expect(result[0][0]).toBe(0);
    expect(result[1][0]).toBe(1);
    expect(result[2][0]).toBe(2);
  });

  it("should support negative start index", () => {
    const arr = ["a", "b"];
    const result = Array.from(enumerate(arr, -1));

    expect(result).toEqual([
      [-1, "a"],
      [0, "b"],
    ]);
  });
});
