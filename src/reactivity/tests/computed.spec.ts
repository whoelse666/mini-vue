


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
    // 检查comVal.value是否等于1
    expect(getter).not.toHaveBeenCalled();
    expect(comVal.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // 获取值
    comVal.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 设置值
    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(comVal.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    comVal.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});

