import { Fragment, createVNode } from "./vnode";

export function renderSlots(slots, name, props) {
  if (typeof slots[name] === "function") {
    return createVNode(Fragment, {}, slots[name](props));
  }
}
