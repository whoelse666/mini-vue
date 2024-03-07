export function createVNode(type, props?, children?) {
  console.log("createVNode");
  console.table(type);
  /* 创建虚拟节点结构 */
  return {
    type,
    props,
    children
  };
}
