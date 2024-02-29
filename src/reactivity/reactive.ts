import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}
// 创建一个响应式对象
export function reactive(target) {
  // 使用Proxy构造函数，传入target和mutableHandlers，创建一个响应式对象
  return new Proxy(target, mutableHandlers);
}

// 创建一个只读响应式对象
export function readonly(target) {
  // 使用Proxy构造函数，传入target和readonlyHandlers，创建一个只读响应式对象
  return new Proxy(target, readonlyHandlers);
}



// 导出一个函数，用于判断传入的值是否为响应式
export function isReactive(value) {
  // 打印传入的值
  console.log('value', value)
  // 返回传入值的响应式属性
  return value[ReactiveFlags.IS_REACTIVE]; 
}

export function isReadonly(value) {
  return value[ReactiveFlags.IS_READONLY]; 
}
