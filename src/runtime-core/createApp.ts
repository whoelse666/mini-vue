import { render } from "./render";




export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      console.log("rootComponent", rootComponent);
      console.log("rootContainer", rootContainer);
      //  把传入信息转换为 vnode
      const vnode =  createVnode(rootComponent);
      //  根据 vnode 生成真实dom
      const  el =  render(vnode,rootContainer);
    }
  };
}