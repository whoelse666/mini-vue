import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

function createReactiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers);
}
// 创建一个响应式对象
export function reactive(target) {
  // 使用Proxy构造函数，传入target和mutableHandlers，创建一个响应式对象
  return createReactiveObject(target, mutableHandlers);
}

// 创建一个只读响应式对象
export function readonly(target) {
  // 使用Proxy构造函数，传入target和readonlyHandlers，创建一个只读响应式对象
  return createReactiveObject(target, readonlyHandlers);
}

// 导出一个函数，用于创建浅响应对象
export function shallowReadonly(target) {
  // 调用createReactiveObject函数，传入target和shallowReadonlyHandlers参数
  return createReactiveObject(target, shallowReadonlyHandlers);
}

export function isObject(target) {
  return typeof target === "object" && target !== null;
}

// 导出一个函数，用于判断传入的值是否为响应式
export function isReactive(value) {
  // 返回传入值的响应式标志位
  return !!value[ReactiveFlags.IS_REACTIVE];
}

// 导出一个函数，用于判断传入的值是否为只读
export function isReadonly(value) {
  // 返回传入值的ReactiveFlags.IS_READONLY属性值
  // TODO 到测试 不使用 !! 单测不过 bug
  return !!value[ReactiveFlags.IS_READONLY];
}
