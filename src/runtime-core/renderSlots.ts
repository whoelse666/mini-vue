import { createVNode } from "./vnode";

export function renderSlots(slots, name, props) {
  if (typeof slots[name] === "function") {
    return createVNode("div", {}, slots[name](props));
  }
}
