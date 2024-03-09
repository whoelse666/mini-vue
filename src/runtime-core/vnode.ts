import { ShapeFlags } from "../shared/shapeFlags";
// export const enum ShapeFlags {
//   ELEMENT = 1, // 0001
//   STATEFUL_COMPONENT = 1 << 1, // 0010
//   TEXT_CHILDREN = 1 << 2, // 0100
//   ARRAY_CHILDREN = 1 << 3 // 1000
// }

// 导出一个函数，用于创建虚拟节点
export function createVNode(type, props?, children?) {
  // 打印出type的表格
  console.table(type);
  /* 创建虚拟节点结构 */

  // 创建一个vnode对象，用于存储虚拟节点的信息
  const vnode = {
    type,
    props,
    children,
    // 初始设置shapeFlag
    shapeFlag: getShapeFlag(type),
    el: null
  };

  // 如果children是字符串，则设置shapeFlag的文本子节点标志
  //  结合厨师的 shapeFlag  ,  位运算, vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  // TODO 位运算符 使用,实现优化判断
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    // 如果children是数组，则设置shapeFlag的数组子节点标志
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    //  vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }
  // 返回vnode对象
  return vnode;
}

// 根据传入的参数type的类型，返回不同的ShapeFlag
function getShapeFlag(type: any) {
  // 如果type的类型是字符串，则返回ShapeFlags.ELEMENT
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
