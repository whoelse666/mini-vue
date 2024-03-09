import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

// 导出一个函数，用于创建组件实例
export function createComponentInstance(vnode) {
  // 创建一个组件对象
  const component = {
    // 将vnode赋值给组件对象
    vnode,
    // 获取vnode的type属性赋值给组件对象
    type: vnode.type
  };
  // 返回组件对象
  return component;
}

export function setupComponent(instance: any) {
  //happy path init component data
  // TODO : 1. initProps()  2.initSlots()
  initProps(instance, instance.vnode.props);
  setupStatefulComponent(instance);
}

// 函数setupStatefulComponent接收一个参数instance，用于设置状态组件
// 获取 setup() 返回结果,挂在到instance上
function setupStatefulComponent(instance: any) {
  const { type, vnode, props } = instance;
  const { setup } = type;
  console.log("props", props);
  // 调用setup函数，获取setupResult
  const setupResult = setup && setup(props);
  const proxy = new Proxy(
    instance,
    // { _: instance },
    PublicInstanceProxyHandlers
  );
  instance.proxy = proxy;
  // 调用handleSetupResult函数，传入instance和setupResult
  handleSetupResult(instance, setupResult);
}

//函数handleSetupResult，用于处理setupResult
function handleSetupResult(instance: any, setupResult) {
  //  Object  or function
  //  setup 调用的两种方式,
  // 1. Object
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  } else if (typeof setupResult === "function") {
    // TODO 2. Object
    console.log('setupResult === "object")');
  }
  finishComponent(instance);
}

// 函数finishComponent接收一个参数instance，用于完成组件
function finishComponent(instance: any) {
  console.log("instance.vnode", instance.vnode);
  // 如果instance的type属性有render方法，则将instance的render属性设置为instance的type属性的render方法
  if (instance.type.render) {
    //  把 render 提高结构层级,简化调用
    instance.render = instance.type.render;
  }
}

