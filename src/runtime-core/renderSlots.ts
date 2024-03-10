import { createVNode } from "./vnode";

export function renderSlots(slots, name) {
  return createVNode("div", {}, slots);
}
