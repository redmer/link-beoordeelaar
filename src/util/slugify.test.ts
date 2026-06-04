import slugify from "./slugify.js";

describe("slugify", () => {
  it("should convert to lowercase", () => {
    const result = slugify("Hello World", { allowUnicode: false });
    expect(result).toBe("hello-world");
  });

  it("should remove spaces", () => {
    const result = slugify("hello world test", { allowUnicode: false });
    expect(result).toBe("hello-world-test");
  });

  it("should remove special characters", () => {
    const result = slugify("hello! @world# $test%", { allowUnicode: false });
    expect(result).toBe("hello-world-test");
  });

  it("should remove leading and trailing spaces", () => {
    const result = slugify("  hello world  ", { allowUnicode: false });
    expect(result).toBe("hello-world");
  });

  it("should convert non-ASCII characters when allowUnicode is false", () => {
    const result = slugify("café", { allowUnicode: false });
    expect(result).toBe("cafe");
  });

  it("should preserve Unicode characters when allowUnicode is true", () => {
    const result = slugify("café", { allowUnicode: true });
    expect(result).toContain("café");
  });

  it("should handle hyphens", () => {
    const result = slugify("hello-world-test", { allowUnicode: false });
    expect(result).toBe("hello-world-test");
  });

  it("should handle multiple hyphens and spaces", () => {
    const result = slugify("hello --- world   test", { allowUnicode: false });
    expect(result).toBe("hello-world-test");
  });

  it("should convert numbers to string and process", () => {
    const result = slugify(12345, { allowUnicode: false });
    expect(result).toBe("12345");
  });

  it("should handle empty strings", () => {
    const result = slugify("", { allowUnicode: false });
    expect(result).toBe("");
  });

  it("should handle strings with only special characters", () => {
    const result = slugify("!@#$%^&*()", { allowUnicode: false });
    expect(result).toBe("");
  });

  it("should handle strings with underscores", () => {
    const result = slugify("hello_world_test", { allowUnicode: false });
    expect(result).toBe("hello_world_test");
  });

  it("should use default options when not provided", () => {
    const result1 = slugify("Hello World", { allowUnicode: false });
    const result2 = slugify("Hello world", { allowUnicode: false });
    expect(result1).toBe(result2);
  });

  it("should handle real-world examples", () => {
    const testCases = [
      { input: "Link Categorization", expected: "link-categorization" },
      { input: "Node.js Application", expected: "nodejs-application" },
      { input: "Test-Case_Example", expected: "test-case_example" },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(slugify(input, { allowUnicode: false })).toBe(expected);
    });
  });
});
