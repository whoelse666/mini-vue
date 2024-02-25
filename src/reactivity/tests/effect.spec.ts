import { reactive } from "../reactive";
import { effect } from "../effect";
// import { add } from '../index.ts';

describe("effect", () => {
  it("happy path", () => {
    console.log("effect test");
    const user = reactive({
      age: 1
    });
    let nextAge;
    effect(() => {
      console.log(user.age);
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(2);
    //update
    user.age = user.age + 1;
    // expect(nextAge).toBe(3);
  });
});
