import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers"

// 导出一个枚举类型NodeTypes
export const enum NodeTypes {
  // 插值表达式
  INTERPOLATION,
  // 简单表达式
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION
}

export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children
  };
}
