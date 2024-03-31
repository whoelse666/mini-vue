import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  createRootCodegen(root);
  root.helpers = [...context.helpers.keys()];
}
function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}

// 定义函数createTransformContext，用于创建一个转换上下文
function createTransformContext(root: any, options: any) {
  // 返回一个对象，包含根节点root和节点转换列表nodeTransforms
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    }
  };
  return context;
}

// 遍历节点
function traverseNode(node, context) {
  const { nodeTransforms } = context;
  // 遍历节点转换器
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    if (transform) {
      transform(node);
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      // traverseChildren(node.children, context);
      break;
    default:
      break;
  }
}

// 遍历子节点
function traverseChildren(node: any, context: any) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}
