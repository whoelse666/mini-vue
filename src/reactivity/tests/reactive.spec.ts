import { reactive, isReactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    // expect(true).toBe(true);
    const original = { num: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    // expect(isReactive(observed)).toBe(true);
    expect(observed.num).toBe(1);
  });
});
