// import { render } from "./render";
import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 创建 vnode
        const vnode = createVNode(rootComponent);
        // 创建 dom
        render(vnode, rootContainer);
      }
    };
  };
}
