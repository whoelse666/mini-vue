/* createRender 作用： 可以让用户 传入不同的 
函数执行不同平台的api， 
*/

import { createRender } from "../runtime-core/render";

// 创建一个函数，用于创建元素
export function createElement(type) {
  // 返回创建的元素
  return document.createElement(type);
}
// 为元素el设置属性，key为属性名，val为属性值
export function patchProp(el, key, val) {
  // 判断属性名是否以on开头
  const isOn = () => /^on[A-Z]/.test(key);
  // if (key.startsWith("on")) {
  // 如果是on开头，则将属性名转换为小写，并添加事件监听
  if (isOn()) {
    el.addEventListener(key.slice(2).toLowerCase(), val);
  } else {
    // 否则直接设置属性
    el.setAttribute(key, val);
  }
}

// 向父元素插入新元素
export function insert(el, parent) {
  parent.append(el);
}
const renderObj: any = createRender({
  createElement,
  patchProp,
  insert
});

export function createApp(...args) {
  return renderObj.createApp(...args);
}
