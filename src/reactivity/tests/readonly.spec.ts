import { readonly } from "../reactive";

describe("readonly", () => {
  it("should make nested values readonly", () => {
    const original = { foo: 1 };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10
    });
    expect(console.warn).toBeCalledTimes(0);
    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
    expect(user.age).toBe(10);
    expect(console.warn).toBeCalledTimes(1);
  });
});
