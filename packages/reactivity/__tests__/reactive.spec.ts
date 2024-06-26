import { reactive, isReactive, isReadonly, readonly, isProxy } from "../src/reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { num: 1 };
    const observed = reactive(original);
    const obj = readonly(original);
    expect(observed).not.toBe(original);
    expect(isReactive(observed)).toBe(true);
    expect(isReadonly(observed)).toBe(false);

    expect(isReactive(obj)).toBe(false);
    expect(isReadonly(obj)).toBe(true);
    expect(isProxy(observed)).toBe(true);
    
    expect(observed.num).toBe(1);
  });
  it("nested reactives", () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
