import { hasOwn, isObject } from "../shared/index";

const publicPropsMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};

// 导出一个常量PublicInstanceProxyHandlers，它是一个对象
export const PublicInstanceProxyHandlers = {
  // 定义一个get方法，接收两个参数：instance和key
  get(instance, key) {
    // 从instance中获取setupState
    const { setupState, props } = instance;
    // 如果setupState中存在key，则返回setupState中的key

    if (setupState && hasOwn(setupState, key)) {
      return setupState[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    }

    //props 包括了 slots emits  attributer(id,class...)
    const publicGetter = publicPropsMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  }
};
