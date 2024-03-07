export function createVNode(type, props?, children?) {
    console.log("createVNode");
    console.table(type);
  return {
    type,
    props,
    children
  };
}
