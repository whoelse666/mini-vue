import { reactive } from "../reactive";
import { effect } from "../effect";
// import { add } from '../index.ts';

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
      return  "count"
    })
    expect(count).toBe(1)
    const r = runner()
    expect(r).toBe('count')
    expect(count).toBe(2)
  })
});
