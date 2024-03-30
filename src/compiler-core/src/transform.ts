export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  createRootCodegen(root);
}

// 遍历节点
function traverseNode(root, context) {
  const { nodeTransforms } = context;
  // 遍历节点转换器
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodeTransform = nodeTransforms[i];
    if (nodeTransform) {
      nodeTransform(root);
    }
  }
  traverseChildren(root.children, context);
}

// 遍历子节点
function traverseChildren(children: any, context: any) {
  // const children = root.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}

// 定义函数createTransformContext，用于创建一个转换上下文
function createTransformContext(root: any, options: any) {
  // 返回一个对象，包含根节点root和节点转换列表nodeTransforms
  return {
    root,
    nodeTransforms: options.nodeTransforms || []
  };
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}
