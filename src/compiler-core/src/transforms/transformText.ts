import { NodeTypes } from "../ast";
export function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
}

/*   处理符合类型，将 children 在多包一层  {
                type: NodeTypes.COMPOUND_EXPRESSION,
                children: [child]
              }; */
export function transformText(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    const { children } = node;
    let currentContainer;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (isText(child)) {
        for (let j = i + 1; j < children.length; j++) {
          const next = children[j];
          if (isText(next)) {
            if (!currentContainer) {
              currentContainer = children[i] = {
                type: NodeTypes.COMPOUND_EXPRESSION,
                children: [child]
              };
            }
            currentContainer.children.push(" + ", next);
            children.splice(j, 1);
            j--;
          } else {
            currentContainer = null;
            break;
          }
        }
      }
    }
  console.log("22222222222222222222", node.children[0].children);

  }
}
