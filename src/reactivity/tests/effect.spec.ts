import { reactive } from "../reactive";
import { effect } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
      name: "John"
    });
    let nextAge, nextName;
    effect(() => {
      nextAge = user.age + 1;
      nextName = user.name;
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
          },
          { scheduler }
        );
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // // should not run yet
        expect(dummy).toBe(1);
        // // manually run
        run();
        // // should have run
        expect(dummy).toBe(2);
    // let dummy, run;
    // const scheduler = jest.fn(() => {
    //   console.log("scheduler");
    //   run = runner;
    // });
    // const obj = reactive({ num: 1 });
    // const runner = effect(
    //   () => {
    //     console.log("run");
    //     dummy = obj.num;
    //   },
    //   { scheduler }
    // );

    // expect(scheduler).not.toHaveBeenCalled();
    // expect(dummy).toBe(1);
    // obj.num++;
    // // expect(scheduler).toHaveBeenCalledTimes(1);
    // // expect(dummy).toBe(1);
    // // expect(scheduler).toHaveBeenCalledTimes(2);
    // // runner();
  });
});
