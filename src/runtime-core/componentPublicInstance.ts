const publicPropsMap = {
  $el: ({ vnode }) => vnode && vnode.el
  // $props:(ins) => ins.vnode.props,
};

// 导出一个常量PublicInstanceProxyHandlers，它是一个对象
export const PublicInstanceProxyHandlers = {
  // 定义一个get方法，接收两个参数：instance和key
  get(instance, key) {
    // 从instance中获取setupState
    const { setupState } = instance;
    // 如果setupState中存在key，则返回setupState中的key
    if (key in setupState) {
      return setupState[key];
    }
    const publicGetter = publicPropsMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  }
};
