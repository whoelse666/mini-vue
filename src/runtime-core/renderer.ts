import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement, insert, patchProp: hostPatchProp } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  // 函数patch,用于处理vnode和container
  function patch(n1, n2: any, container: any, parentComponent) {
    /* TODO :区分 component 和 element */
    // fixme 如果vnode的类型是字符串, ===vnode 就是element 类型参数
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processTextVNode(n1, n2, container);
        break;
      default:
        // if (typeof vnode.type === "string") {
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
          //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n2, container, parentComponent);
        }
    }
  }

  // 函数processComponent,用于处理组件
  function processComponent(vnode: any, container: any, parentComponent) {
    // 调用mountComponent函数处理vnode和container
    mountComponent(vnode, container, parentComponent);
  }

  // 函数processElement,用于处理元素
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      // 调用mountElement函数处理vnode和container
      mountElement(n1, n2, container, parentComponent);
    } else {
      // 调用patchElement函数处理vnode和container
      patchElement(n1, n2, container, parentComponent);
    }
  }

  // 函数patchElement，用于更新DOM节点
  function patchElement(n1: any, n2: any, container: any, parentComponent: any) {
    console.log("patchElement");
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    n2.el = n1.el;
    patchProps(oldProps, newProps, n1.el);
  }

  function patchProps(oldProps, newProps, el) {
    // 更新props
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    for (const key in oldProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (!nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }


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
  function mountElement(n1, n2: any, container: any, parentComponent) {
    // const el = document.createElement(vnode.type);
    const el = createElement(n2.type);

    // 1. $el-> 挂在el
    n2.el = el;
    const { children, props, shapeFlag } = n2;
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
      hostPatchProp(el, key, null,val);
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
      patch(null, v, container, parentComponent);
    });
  }

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
  // 函数setupRenderEffect,用于设置渲染效果
  function setupRenderEffect(instance: any, initialVNode, container: any) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("isMounted");
        // const subTree = instance.render(); // h()函数返回
        const subTree = (instance.subTree = instance.render.call(instance.proxy)); // h()函数返回
        patch(null, subTree, container, instance);
        // 2. $el-> 挂在el
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        const prevSubTree = instance.subTree;
        const subTree = instance.render.call(instance.proxy);
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processTextVNode(n1, n2: any, container: any) {
    const el = document.createTextNode(n2.children);
    n2.el = el;
    container.append(el);
  }

  // TODO  createRenderer-01
  // createAppAPI 依赖render ，所以在这里调用获取render 的值
  // 方法1   return { render };
  // 方法2  return { createApp: createAppAPI(render) };
  return { createApp: createAppAPI(render) };
}
