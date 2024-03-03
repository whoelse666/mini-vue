import { computed } from "../computed";
import { reactive } from "../reactive";
// import { vi } from "vitest";
describe("computed", () => {
  it("happy path", () => {
    const value = reactive({
      foo: 1
    });
    const age = computed(() => {
      return value.foo;
    });
    expect(age.value).toBe(1);
  });

  it("should computed is lazily", () => {
    const value = reactive({
      foo: 1
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const comVal = computed(getter);
    expect(getter).not.toHaveBeenCalled();
    expect(comVal.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    comVal.value;
    expect(getter).toHaveBeenCalledTimes(1);

    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);
    expect(getter).toBe(2);
  });
});
