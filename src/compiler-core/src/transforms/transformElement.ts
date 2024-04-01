import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers"

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    // note context.helper()  ===  context.helpers.set(key, 1); helpers: new Map()
    context.helper(CREATE_ELEMENT_VNODE);
  }
}
