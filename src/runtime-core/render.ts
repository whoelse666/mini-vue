import { ShapeFlags } from "../shared/shapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRender(options) {
  const { createElement, insert, patchProp } = options;

  function render(vnode, container) {
    patch(vnode, container, null);
  }

  // 函数patch,用于处理vnode和container
  function patch(vnode: any, container: any, parentComponent) {
    /* TODO :区分 component 和 element */
    // fixme 如果vnode的类型是字符串, ===vnode 就是element 类型参数
    const { shapeFlag, type } = vnode;
    // console.log("type", type);
    // console.log('vnode.shapeFlag',vnode.shapeFlag);
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processTextVNode(vnode, container);
        break;
      default:
        // if (typeof vnode.type === "string") {
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
          //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        }
    }
  }

  // 函数processComponent,用于处理组件
  function processComponent(vnode: any, container: any, parentComponent) {
    // 调用mountComponent函数处理vnode和container
    mountComponent(vnode, container, parentComponent);
  }

  // 函数processElement,用于处理元素
  function processElement(vnode: any, container: any, parentComponent) {
    // 调用mountElement函数处理vnode和container
    mountElement(vnode, container, parentComponent);
  }

  // 函数mountComponent,用于处理组件
  function mountComponent(vnode: any, container: any, parentComponent) {
    //  创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    // 完成对instance 的 初始化处理
    setupComponent(instance);
    //这里已经完成了vnode 的处理，--> 渲染实例
    setupRenderEffect(instance, vnode, container);
  }

  //  处理vnode ->  element
  function mountElement(vnode: any, container: any, parentComponent) {
    // const el = document.createElement(vnode.type);
    const el = createElement(vnode.type);

    // 1. $el-> 挂在el
    vnode.el = el;
    const { children, props, shapeFlag } = vnode;
    // children
    // shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    // if (typeof children === "string") {
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本节点
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    }

    // props
    for (const key in props) {
      const val = props[key];
      patchProp(el, key, val);
      /* 
    const isOn = () => /^on[A-Z]/.test(key);
    // if (key.startsWith("on")) {
    if (isOn()) {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    } */
    }
    // container.append(el);
    insert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.forEach(v => {
      // 调用patch函数处理v和container
      patch(v, container, parentComponent);
    });
  }

  // 函数setupRenderEffect,用于设置渲染效果
  function setupRenderEffect(instance: any, initialVNode, container: any) {
    // const subTree = instance.render(); // h()函数返回
    const subTree = instance.render.call(instance.proxy); // h()函数返回
    /* 组件类型( ShapeFlags.STATEFUL_COMPONENT ) 到这里时候 ，instance 初始化完成  (每一个组件的 初始 root )
 instance = {
   emit: ƒ ()
   render:ƒ render()
    parent
    props
    provides
    proxy: Proxy(Object)
    setupState
    slots
    type
    vnode
  } */
    patch(subTree, container, instance);
    // 2. $el-> 挂在el
    initialVNode.el = subTree.el;
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
  }

  function processTextVNode(vnode: any, container: any) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.append(el);
  }

  //createAppAPI 依赖render ，所以在这里调用获取render 的值
  return { createApp: createAppAPI(render) };
}
