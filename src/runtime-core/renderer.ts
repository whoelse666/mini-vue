import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement, insert, patchProp: hostPatchProp, setElementText: hostSetElementText, remove: hostRemove } = options;

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
  // 函数patchElement，用于更新组件的props
  function patchElement(n1: any, n2: any, container: any, parentComponent: any) {
    console.log("patchElement");
    // 获取旧props
    const oldProps = n1.props || {};
    // 获取新props
    const newProps = n2.props || {};
    // 更新组件的el
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent);
    // 更新props
    patchProps(oldProps, newProps, n1.el);
  }

  function patchChildren(n1, n2, container, parentComponent) {
    console.log("patchChildren");
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    //新的children是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的children是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 移除旧子节点
        unmountChildren(n1.children);
        // 设置新的元素文本
        hostSetElementText(container, n2.children);
      }
      if (c1 !== c2) {
        //旧的 children  是文本, 直接用新的文本覆盖旧的
        hostSetElementText(container, n2.children);
      }
    }
    // 新的children是数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 老的children是文本
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 移除旧的文本节点
        hostSetElementText(container, "");
        // 挂载新的的子节点
        mountChildren(n2.children, container, parentComponent);
      } else {
        // 新的children是数组，老的children是数组，需要更新
        console.log("新的children是数组，老的children是数组，需要更新");
      }
    }
  }

  function patchProps(oldProps, newProps, el) {
    // 更新props
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        // 比较新旧props，如果不同，则更新
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    for (const key in oldProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (!nextProp) {
        // 如果新props中没有该prop，则删除
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
      hostPatchProp(el, key, null, val);
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

  // 遍历children，调用patch函数处理每一个v，并将其添加到container中
  function mountChildren(children, container, parentComponent) {
    children.forEach(v => {
      // 调用patch函数处理v和container
      patch(null, v, container, parentComponent);
    });
  }

  // 遍历children，调用hostRemove函数移除每一个el
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
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
        // const subTree = instance.render(); // h()函数返回
        const subTree = (instance.subTree = instance.render.call(instance.proxy)); // h()函数返回
        patch(null, subTree, container, instance);
        // 2. $el-> 挂在el
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
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
