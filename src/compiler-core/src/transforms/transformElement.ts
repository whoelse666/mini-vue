import { NodeTypes, createVNodeCall } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformElement(node, context) {
  return () => {
    if (node.type === NodeTypes.ELEMENT) {
      // note context.helper()  ===  context.helpers.set(key, 1); helpers: new Map()
      const vnodeTag = `'${node.tag}'`;
      let vnodeProps = null;
      const vnodeChildren = node.children[0];

      /*  
        context.helper(CREATE_ELEMENT_VNODE);
    const vnodeElement = {
          type: NodeTypes.ELEMENT,
          tag: vnodeTag,
          props: vnodeProps,
          children: vnodeChildren
        };
        node.codegenNode = vnodeElement; */
      node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
      console.log("transformElement====================", node);
    }
  };
}
