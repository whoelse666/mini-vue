import { reactive } from "../reactive";
import { effect } from "../effect";
// import { add } from '../index.ts';

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(2);
    //update
    user.age = user.age + 1;
    expect(nextAge).toBe(3);
  });
});
