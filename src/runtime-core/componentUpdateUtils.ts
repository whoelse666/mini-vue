// 导出一个函数，用于判断组件是否需要更新
export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;
  // 遍历下一个节点的props
  for (const key in nextProps) {
    // 如果下一个节点的props和上一个节点的props不相等，则返回true
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  // 否则返回false
  return false;
}
