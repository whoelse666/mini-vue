import { isObject } from "../reactivity/index";
import { createComponentInstance } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountComponent(vnode: any, container: any) {
  //  创建组件实例
  const instance = createComponentInstance(vnode);
  const { render, setup } = instance.type;
  const newVnode = render();
  // const setupData = setup();
  const { props, children } = newVnode;
  const el = document.createElement(newVnode.type);
  // set dom props
  if (isObject(props)) {
    Object.keys(props).forEach(key => {
      el.setAttribute(key, props[key]);
    });
  }

  // let child: any = document.createDocumentFragment();
  let child;
  if (typeof children === "string") {
    child = document.createTextNode(children);
  } else if (Array.isArray(children)) {
    children.forEach(v => {
      patch(v, el);
    });
  }
  child && el.append(child);
  container.append(el);

  // setupComponent(instance);
  // setupRenderEffect(instance, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;
  // children
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }

  // props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.append(el);
}

function mountChildren(vnode, container) {
   vnode.children.forEach(v => {
     patch(v, container);
   });
}

function setupRenderEffect(vnode: any, container: any) {
  console.log("setupRenderEffect");
}
