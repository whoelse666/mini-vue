import { createVNode } from "./vnode";


export function h(type, props?, children?) {
  console.log('type, props?, children?',type, props, children);
  return createVNode(type, props, children);
}
