import { effect } from "../src/effect";
import { reactive } from "../src/reactive";
import { isRef, proxyRefs, ref, unRef } from "../src/ref";
describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("should be reactive", () => {
    const a = ref(1);
    let dummy, num;
    let calls = 0;
    //“(创建一个副作用函数，每次a.value改变时会调用)”
    effect(() => {
      calls++;
      dummy = a.value;
    });
    // 期望副作用函数被调用一次
    expect(calls).toBe(1);
    // 期望dummy的值是1
    expect(dummy).toBe(1);
    // 修改a.value的值
    a.value = 2;
    // 期望副作用函数被调用两次
    expect(calls).toBe(2);
    // 期望dummy的值是2
    expect(dummy).toBe(2);
    // same value should not trigger
    // 修改a.value的值
    a.value = 2;
    // 期望副作用函数被调用两次
    expect(calls).toBe(2);
    // 期望dummy的值是2
    expect(dummy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    // 期望dummy的值是1
    expect(dummy).toBe(1);
    // 修改a.value的值
    a.value.count = 2;
    // 期望dummy的值是2
    expect(dummy).toBe(2);
  });

  it("isRef", () => {
    // 创建一个ref对象
    const a = ref(1);
    const obj = ref({ num: 1 });
    // 创建一个响应式对象
    const user = reactive({ age: 1 });
    // 创建一个普通变量
    const b = 1;
    // 断言b是否为ref对象
    expect(isRef(b)).toBe(false);
    // 断言user是否为ref对象
    expect(isRef(user)).toBe(false);
    // 断言a是否为ref对象
    expect(isRef(a)).toBe(true);
  });

  it("unRef", () => {
    const a = ref(1);
    const aObj = ref({ age: 1 });
    const obj = { num: 1 };
    const b = 1;
    // 断言b是否为ref对象
    expect(unRef(b)).toBe(b);
    // 断言a是否为ref对象
    expect(unRef(a)).toBe(a.value);
    // 断言user是否为ref对象
    // 测试unRef函数是否可以正确返回传入的参数
    expect(unRef(obj)).toBe(obj);
    // expect(unRef(aObj)).toBe(aObj);
  });

 it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "牛魔王"
    };
    // 创建代理对象
    const proxyUser = proxyRefs(user);
    // 断言普通属性值
    expect(user.age.value).toBe(10);
    expect(proxyUser.name).toBe("牛魔王");
    expect(proxyUser.age).toBe(10);

    // set 普通值
    proxyUser.age = 20;
    expect(user.age.value).toBe(20);
    expect(proxyUser.age).toBe(20);

    // set ref值
    proxyUser.age = ref(30);
    expect(user.age.value).toBe(30);
    expect(proxyUser.age).toBe(30);
  });
});
