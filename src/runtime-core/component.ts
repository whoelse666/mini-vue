import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmits";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
import { proxyRefs } from "..";

// 导出一个函数，用于创建组件实例
export function createComponentInstance(vnode, parent) {
  console.log("parent", parent, parent?.provides);

  // 创建一个组件对象
  const component = {
    // 将vnode赋值给组件对象
    vnode,
    // 获取vnode的type属性赋值给组件对象
    type: vnode.type,
    setupState: {},
    props: {},
    provides: parent ? parent.provides : {},
    parent,
    slots: {},
    emit
  };
  component.emit = emit.bind(null, component) as any;
  // 返回组件对象
  return component;
}

export function setupComponent(instance: any) {
  //happy path init component data
  // TODO : 1. initProps()  2.initSlots()
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}

// 函数setupStatefulComponent接收一个参数instance，用于设置状态组件
// 获取 setup() 返回结果,挂在到instance上
function setupStatefulComponent(instance: any) {
  const { type, vnode, props, emit } = instance;
  const { setup } = type;
  const proxy = new Proxy(
    instance,
    // { _: instance },
    PublicInstanceProxyHandlers
  );
  instance.proxy = proxy;

  setCurrentInstance(instance);
  // 调用setup函数，获取setupResult
  const setupResult = setup && setup(shallowReadonly(props), { emit });
  setCurrentInstance(null);

  // 调用handleSetupResult函数，传入instance和setupResult
  handleSetupResult(instance, setupResult);
}

//函数handleSetupResult，用于处理setupResult
function handleSetupResult(instance: any, setupResult) {
  //  Object  or function
  //  setup 调用的两种方式,
  // 1. Object
  if (typeof setupResult === "object") {
    // instance.setupState = setupResult
    instance.setupState = proxyRefs(setupResult);
  } else if (typeof setupResult === "function") {
    // TODO 2. Object
    console.log('setupResult === "object")');
  }
  finishComponent(instance);
}

// 函数finishComponent接收一个参数instance，用于完成组件
function finishComponent(instance: any) {
  // 如果instance的type属性有render方法，则将instance的render属性设置为instance的type属性的render方法
  if (instance.type.render) {
    //  把 render 提高结构层级,简化调用
    instance.render = instance.type.render;
  }
}

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}

/* 在setup 中执行getCurrentInstance 获取当前实例后重置为null ,所以在setup()前后设置instance  和重置  */
export function setCurrentInstance(instance) {
  currentInstance = instance;
}
