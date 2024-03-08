import { isObject } from "../reactivity/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

// 函数patch，用于处理vnode和container
//
function patch(vnode: any, container: any) {

  /* TODO :区分 component 和 element */
  // fixme 如果vnode的类型是字符串, ===vnode 就是element 类型参数
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
    //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

// 函数processComponent，用于处理组件
function processComponent(vnode: any, container: any) {
  // 调用mountComponent函数处理vnode和container
  mountComponent(vnode, container);
}

// 函数processElement，用于处理元素
function processElement(vnode: any, container: any) {
  // 调用mountElement函数处理vnode和container
  mountElement(vnode, container);
}

// 函数mountComponent，用于处理组件
function mountComponent(vnode: any, container: any) {
  //  创建组件实例
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

// 函数setupRenderEffect，用于设置渲染效果
function setupRenderEffect(instance: any, container: any) {
  // const subTree = instance.render(); // h()函数返回
  const subTree = instance.render.call(instance.proxy); // h()函数返回
  patch(subTree, container);
}

//  处理vnode ->  element
function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  vnode.el = el;
  const { children, props } = vnode;
  // children
  if (typeof children === "string") {
    // 文本节点
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }

  // props
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.forEach(v => {
    // 调用patch函数处理v和container
    patch(v, container);
  });
}
