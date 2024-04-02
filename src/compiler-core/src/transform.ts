import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  createRootCodegen(root);
  root.helpers = [...context.helpers.keys()];
}

// 给 createRootCodegen 函数添加中文注释
function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    // 将 root 的第一个子节点设置为 root.codegenNode
    root.codegenNode = root.children[0];
  }
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
  const exitFns: any = [];
  // 遍历节点转换器
  for (let i = 0; i < nodeTransforms.length; i++) {
    // todo ：    nodeTransforms === [transformExpression,  transformElement, transformText ]
    // const transform = nodeTransforms[i];
    const nodeTransform = nodeTransforms[i];
    if (nodeTransform) {
      const onExit = nodeTransform(node, context);
      onExit && exitFns.push(onExit);
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
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
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
