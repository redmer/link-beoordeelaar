import delay from "./delay.js";

describe("delay", () => {
  it("should delay execution by the specified time", async () => {
    const startTime = Date.now();
    const timeout = 100; // 100ms

    await delay(timeout);

    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(timeout);
  });
});
