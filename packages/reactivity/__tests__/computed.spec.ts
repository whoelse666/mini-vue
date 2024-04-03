import { computed } from "../src/computed";
import { reactive } from "../src/reactive";
// import { vi } from "vitest";
describe("computed", () => {
  it("happy path", () => {
    // 创建一个响应式对象
    const value = reactive({
      foo: 1
    });
    // 创建一个计算属性，计算属性返回value.foo的值
    const age = computed(() => {
      return value.foo;
    });
    // 断言age的值是否等于1
    expect(age.value).toBe(1);
  });


  it("should computed is lazily", () => {
    const value = reactive({
      foo: 1
    });
    const getter = jest.fn(() => {
      //  ComputedRefImpl-> get-03
      return value.foo;
    });
    const comVal = computed(getter);
    // 检查comVal.value是否等于1
    expect(getter).not.toHaveBeenCalled();
    /* 在comVal.value 的时候执行 ComputedRefImpl-> get-01 ,触发effect.run() ；
    ComputedRefImpl-> get-02 执行 ComputedRefImpl-> get-03  ,触发 this._fn
     */
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
