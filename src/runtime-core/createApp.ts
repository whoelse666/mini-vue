import { render } from "./render";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      //  把传入信息转换为 vnode
      const vnode = createVNode(rootComponent);
      //  根据 vnode 生成真实dom
      render(vnode, rootContainer);
    }
  };
}
