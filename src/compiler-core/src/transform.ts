
export function transform(root ,options) {
  // 处理数据
  const context = createTransformContext(root,options);
  traverseNode(root,context);
}

function createTransformContext(root: any, options: any): any {
   return {
     root,
     nodeTransforms: options.nodeTransforms || []
   }
}

function traverseNode(node: any, context: any) {
  const children = node.children;
   const { nodeTransforms } = context;
   for (let index = 0; index <nodeTransforms.length; index++) {
    const transformFn = nodeTransforms[index];
    transformFn(node)
   };
  
  traverseChildren(children, context)
}

function traverseChildren(children: any, context: any) {
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNode(node, context)
    }
  }
}

