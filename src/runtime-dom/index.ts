/* createRenderer 作用： 可以让用户 传入不同的 
函数执行不同平台的api， 
*/
import { createRenderer } from "../runtime-core";
import { createVNode } from "../runtime-core/vnode";
export * from "../runtime-core";

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
const renderObj: any = createRenderer({
  createElement,
  patchProp,
  insert
});

// TODO  createRenderer-01
/* // 方法1 
  export function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 创建 vnode
        const vnode = createVNode(rootComponent);
        // 创建 dom
        renderObj.render(vnode, rootContainer);
      }
    };
  } */

/* // 方法2 
export function createApp(...args) {
  return renderObj.createApp(...args);
} */
export function createApp(...args) {
  return renderObj.createApp(...args);
}
