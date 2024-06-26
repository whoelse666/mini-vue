import { reactive } from "../src/reactive";
import { effect, stop } from "../src/effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
      name: "John"
    });
    // const obj = reactive({
    //   txt: "666"
    // });
    let nextAge, nextName, txt;
    effect(() => {
      nextAge = user.age + 1;
      nextName = user.name;
      // txt = obj.txt;
    });
    expect(nextAge).toBe(2);
    //update
    user.age++;
    user.name = user.name + "is boy";
    expect(nextAge).toBe(3);
  });

  it("should return val when call runner", () => {
    let count = 0;
    const runner = effect(() => {
      count++;
      return "count";
    });
    expect(count).toBe(1);
    const r = runner();
    expect(r).toBe("count");
    expect(count).toBe(2);
  });

  it("scheduler", () => {
    let dummy = 0;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
        return "count";
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    const r = run();
    expect(r).toBe("count");
    // should have run
    expect(dummy).toBe(2);
  });
  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3;
    /* obj.prop = obj.prop + 1 , 会触发getter, 在stop清空后,  effect.deps后有添加一个新的依赖,所以又会执行set */
    obj.prop++;
    expect(dummy).toBe(2);
    expect(obj.prop).toBe(3);
    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});