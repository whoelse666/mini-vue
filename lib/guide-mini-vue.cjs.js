'use strict';

function isObject(target) {
    return typeof target === "object" && target !== null;
}

// 导出一个常量PublicInstanceProxyHandlers，它是一个对象
const PublicInstanceProxyHandlers = {
    // 定义一个get方法，接收两个参数：instance和key
    get(instance, key) {
        // 从instance中获取setupState
        const { setupState } = instance;
        // 如果setupState中存在key，则返回setupState中的key
        if (key in setupState) {
            return setupState[key];
        }
    }
};

// 导出一个函数，用于创建组件实例
function createComponentInstance(vnode) {
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
function setupComponent(instance) {
    //happy path init component data
    // TODO : 1. initProps()  2.initSlots()
    setupStatefulComponent(instance);
}
// 函数setupStatefulComponent接收一个参数instance，用于设置状态组件
// 获取 setup() 返回结果,挂在到instance上
function setupStatefulComponent(instance) {
    const { type, vnode } = instance;
    const { setup } = type;
    // 调用setup函数，获取setupResult
    const setupResult = setup && setup();
    console.log("vnode", vnode.el);
    const proxy = new Proxy(instance, 
    // { _: instance },
    PublicInstanceProxyHandlers);
    instance.proxy = proxy;
    // 调用handleSetupResult函数，传入instance和setupResult
    handleSetupResult(instance, setupResult);
}
//函数handleSetupResult，用于处理setupResult
function handleSetupResult(instance, setupResult) {
    //  Object  or function
    //  setup 调用的两种方式,
    // 1. Object
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    else if (typeof setupResult === "function") {
        // TODO 2. Object
        console.log('setupResult === "object")');
    }
    finishComponent(instance);
}
// 函数finishComponent接收一个参数instance，用于完成组件
function finishComponent(instance) {
    // 如果instance的type属性有render方法，则将instance的render属性设置为instance的type属性的render方法
    if (instance.type.render) {
        //  把 render 提高结构层级,简化调用
        instance.render = instance.type.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
// 函数patch，用于处理vnode和container
//
function patch(vnode, container) {
    /* TODO :区分 component 和 element */
    // fixme 如果vnode的类型是字符串, ===vnode 就是element 类型参数
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
        //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
// 函数processComponent，用于处理组件
function processComponent(vnode, container) {
    // 调用mountComponent函数处理vnode和container
    mountComponent(vnode, container);
}
// 函数processElement，用于处理元素
function processElement(vnode, container) {
    // 调用mountElement函数处理vnode和container
    mountElement(vnode, container);
}
// 函数mountComponent，用于处理组件
function mountComponent(vnode, container) {
    //  创建组件实例
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
// 函数setupRenderEffect，用于设置渲染效果
function setupRenderEffect(instance, container) {
    // const subTree = instance.render(); // h()函数返回
    const subTree = instance.render.call(instance.proxy); // h()函数返回
    patch(subTree, container);
}
//  处理vnode ->  element
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { children, props } = vnode;
    // children
    if (typeof children === "string") {
        // 文本节点
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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

function createVNode(type, props, children) {
    // console.table(type);
    /* 创建虚拟节点结构 */
    return {
        type,
        props,
        children
    };
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 创建 vnode
            const vnode = createVNode(rootComponent);
            // 创建 dom
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
