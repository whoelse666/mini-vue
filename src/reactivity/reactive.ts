import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

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



export function isReactive(target) {
  return 
}
