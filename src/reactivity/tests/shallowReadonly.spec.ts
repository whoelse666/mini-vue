import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      n: { foo: 1 },
      age: 10
    });

    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
    user.n.foo = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
