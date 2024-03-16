'use strict';

// export const enum ShapeFlags {
//   ELEMENT = 1, // 0001
//   STATEFUL_COMPONENT = 1 << 1, // 0010
//   TEXT_CHILDREN = 1 << 2, // 0100
//   ARRAY_CHILDREN = 1 << 3, // 1000
//   SLOT_CHILDREN = 1 << 4 // 1000
// }
const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
// 导出一个函数，用于创建虚拟节点
function createVNode(type, props, children) {
    // 打印出type的表格
    /* 创建虚拟节点结构 */
    // 创建一个vnode对象，用于存储虚拟节点的信息
    const vnode = {
        type,
        props,
        // slots: children,
        key: props && props.key,
        children,
        // 初始设置shapeFlag
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // 如果children是字符串，则设置shapeFlag的文本子节点标志
    //  结合厨师的 shapeFlag  ,  位运算, vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
    // TODO 位运算符 使用,实现优化判断
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
        // 如果children是数组，则设置shapeFlag的数组子节点标志
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
        //  vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
    }
    // 返回vnode对象
    return vnode;
}
// 根据传入的参数type的类型，返回不同的ShapeFlag
function getShapeFlag(type) {
    // 如果type的类型是字符串，则返回ShapeFlags.ELEMENT
    return typeof type === "string" ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(str) {
    return createVNode(Text, {}, str);
}

function renderSlots(slots, name, props) {
    if (typeof slots[name] === "function") {
        return createVNode(Fragment, {}, slots[name](props));
    }
}

// 导出一个函数，用于判断传入的参数是否为对象
function isObject(target) {
    // 判断传入的参数类型是否为object，且不为null
    return typeof target === "object" && target !== null;
}
// 导出一个函数，用于判断传入的参数是否包含指定的属性
const hasChanged = (val, newValue) => {
    // 判断传入的参数是否改变
    return !Object.is(val, newValue);
};
// 导出一个函数，用于判断传入的参数是否包含指定的属性
const hasOwn = (target, key) => {
    // 判断传入的参数是否为对象
    if (!isObject(target)) {
        // 如果不是对象，则报错
        console.log(`target 不是对象`);
        return false;
    }
    // 返回传入的参数是否包含指定的属性
    return Object.prototype.hasOwnProperty.call(target, key);
};
// 将字符串转换为大写
function capitalize(str) {
    // 将字符串的第一个字符转换为大写
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// 将字符串转换为驼峰式
function toHandlerKey(str) {
    // 将字符串转换为on开头，后面接大写字母
    return str ? "on" + str : "";
}
// 将字符串转换为驼峰式
function camelize(event) {
    // 将字符串中的-替换为空字符，并将第一个字符转换为大写
    const res = event.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
    return res;
}

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = []; //stop 用到的数组
        this.active = true; // 是否为激活状态, stop  后为非激活
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        //主动调用 runner 可以执行, 不用通过shouldTrack 判断
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        // ComputedRefImpl-> get-02
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            // shouldTrack = true;
            if (this.onStop) {
                // stop 的回调函数
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.onStop = options.onStop;
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
let targetMap = new Map();
function track(target, key) {
    if (!isTracking()) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    /*   // 前置优化， 过滤重复activeEffect
    if (dep.has(activeEffect)) return;
  
    dep.add(activeEffect);
    activeEffect.deps.push(dep); */
    trackEffects(dep);
}
function trigger(target, key, value) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    if (dep) {
        triggerEffects(dep);
        /*     for (const effect of dep) {
          if (effect.scheduler) {
            effect.scheduler();
          } else {
            effect.run();
          }
        } */
    }
}
// 导出一个函数，用于判断是否处于追踪状态
function isTracking() {
    // 判断shouldTrack和activeEffect是否都不为undefined
    return shouldTrack && activeEffect !== undefined;
}
// 导出一个函数trackEffect，用于跟踪效果
function trackEffects(dep) {
    // 如果dep中已经存在activeEffect，则直接返回
    //
    if (dep.has(activeEffect))
        return;
    // 否则，将value添加到dep中
    dep.add(activeEffect);
    // 将dep添加到activeEffect的依赖中
    activeEffect.deps.push(dep);
}
//   导出一个函数，用于触发效果
function triggerEffects(dep) {
    // 遍历dep中的每一个效果
    for (const effect of dep) {
        // 如果效果中有调度器，则调用调度器
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            // 否则，直接调用效果
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        /* 只要是proxy只要调用 就会触发getter,不论key 任何值;
        对于reactive 和readonly 参数isReadonly  判断
        所以可以给定isReactive , isReadonly  分别一个key   is_reactive  和  is_Readonly
        */
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 收集依赖
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        // fixme :这里需要注意执行顺序,先set 后再触发
        const res = Reflect.set(target, key, value);
        // 执行依赖
        trigger(target, key);
        return res;
    };
}
// function readonlyCreateSetter() {
//   return function set(target) {
//     console.warn(`${target} is readonly`);
//     return true;
//   };
// }
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
        return true;
    }
};
const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
    get: shallowReadonlyGet
});
// export const shallowReadonlyHandlers = {
//   get: shallowReadonlyGet,
//   set(target, key) {
//     console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
//     return true;
//   }
// };

function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}
// 创建一个响应式对象
function reactive(target) {
    // 使用Proxy构造函数，传入target和mutableHandlers，创建一个响应式对象
    return createReactiveObject(target, mutableHandlers);
}
// 创建一个只读响应式对象
function readonly(target) {
    // 使用Proxy构造函数，传入target和readonlyHandlers，创建一个只读响应式对象
    return createReactiveObject(target, readonlyHandlers);
}
// 导出一个函数，用于创建浅响应对象
function shallowReadonly(target) {
    // 调用createReactiveObject函数，传入target和shallowReadonlyHandlers参数
    return createReactiveObject(target, shallowReadonlyHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const getHump = camelize(event); //  提前处理  - 链接name  add-foo-> addFoo
    const handlerName = toHandlerKey(capitalize(getHump));
    const handle = props[handlerName];
    handle && handle(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropsMap = {
    $el: ({ vnode }) => vnode && vnode.el,
    $slots: (v) => v.slots
    // $props:(ins) => ins.vnode.props,
};
// 导出一个常量PublicInstanceProxyHandlers，它是一个对象
const PublicInstanceProxyHandlers = {
    // 定义一个get方法，接收两个参数：instance和key
    get(instance, key) {
        // 从instance中获取setupState
        const { setupState, props } = instance;
        // 如果setupState中存在key，则返回setupState中的key
        if (setupState && hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (props && hasOwn(props, key)) {
            return props[key];
        }
        //props 包括了 slots emits  attributer(id,class...)
        const publicGetter = publicPropsMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    //  instance.slots = Array.isArray(children) ? children : [children];
    const slots = {};
    for (const key in children) {
        const fn = children[key];
        // console.log("fn", fn);
        slots[key] = props => (Array.isArray(fn(props)) ? fn(props) : [fn(props)]);
    }
    instance.slots = slots || {};
}

// 导出一个函数，用于创建组件实例
function createComponentInstance(vnode, parent) {
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
        isMounted: false,
        subTree: {},
        emit
    };
    component.emit = emit.bind(null, component);
    // 返回组件对象
    return component;
}
function setupComponent(instance) {
    //happy path init component data
    // TODO : 1. initProps()  2.initSlots()
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
// 函数setupStatefulComponent接收一个参数instance，用于设置状态组件
// 获取 setup() 返回结果,挂在到instance上
function setupStatefulComponent(instance) {
    const { type, vnode, props, emit } = instance;
    const { setup } = type;
    const proxy = new Proxy(instance, 
    // { _: instance },
    PublicInstanceProxyHandlers);
    instance.proxy = proxy;
    setCurrentInstance(instance);
    // 调用setup函数，获取setupResult
    const setupResult = setup && setup(shallowReadonly(props), { emit });
    setCurrentInstance(null);
    // 调用handleSetupResult函数，传入instance和setupResult
    handleSetupResult(instance, setupResult);
}
//函数handleSetupResult，用于处理setupResult
function handleSetupResult(instance, setupResult) {
    //  Object  or function
    //  setup 调用的两种方式,
    // 1. Object
    if (typeof setupResult === "object") {
        // instance.setupState = setupResult
        instance.setupState = proxyRefs(setupResult);
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
/* 在setup 中执行getCurrentInstance 获取当前实例后重置为null ,所以在setup()前后设置instance  和重置  */
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProviders = currentInstance.parent.provides;
        if (provides === parentProviders) {
            //初始化限制只在第一次是调用
            provides = currentInstance.provides = Object.create(parentProviders);
        }
        provides[key] = value;
        // currentInstance.provides[key] = value;
    }
}
//  inject 是从上层 取值（parent）,所以是要从parent上的 provides  取值
function inject(key, defaultVal) {
    const currentInstance = getCurrentInstance();
    const parentProviders = currentInstance.parent.provides;
    if (!parentProviders[key]) {
        if (typeof defaultVal === "function") {
            return defaultVal();
        }
        return defaultVal;
    }
    return parentProviders[key];
}

// import { render } from "./render";
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 创建 vnode
                const vnode = createVNode(rootComponent);
                // 创建 dom
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, setElementText: hostSetElementText, remove: hostRemove } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    // 函数patch,用于处理vnode和container
    function patch(n1, n2, container, parentComponent, anchor) {
        /* TODO :区分 component 和 element */
        // fixme 如果vnode的类型是字符串, ===vnode 就是element 类型参数
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processTextVNode(n1, n2, container);
                break;
            default:
                // if (typeof vnode.type === "string") {
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                    //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n2, container, parentComponent, anchor);
                }
        }
    }
    // 函数processComponent,用于处理组件
    function processComponent(vnode, container, parentComponent, anchor) {
        // 调用mountComponent函数处理vnode和container
        mountComponent(vnode, container, parentComponent, anchor);
    }
    // 函数processElement,用于处理元素
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 调用mountElement函数处理vnode和container
            mountElement(n1, n2, container, parentComponent, anchor);
        }
        else {
            // 调用patchElement函数处理vnode和container
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    // 函数patchElement,用于更新DOM节点
    // 函数patchElement,用于更新组件的props
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        // 获取旧props
        const oldProps = n1.props || {};
        // 获取新props
        const newProps = n2.props || {};
        // 更新组件的el
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        // 更新props
        patchProps(oldProps, newProps, n1.el);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        console.log("patchChildren");
        const prevShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        //新的children是文本
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 老的children是数组
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
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
        if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 老的children是文本
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 移除旧的文本节点
                hostSetElementText(container, "");
                // 挂载新的的子节点
                mountChildren(n2.children, container, parentComponent, anchor);
            }
            else {
                // 新的children是数组,老的children是数组,需要更新
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0, l2 = c2.length, e1 = c1.length - 1, e2 = l2 - 1;
        // 判断两个虚拟节点是否相同
        function isSameVNodeType(n1, n2) {
            // 判断两个虚拟节点的类型和key是否相同
            return n1.type === n2.type && n1.key === n2.key;
        }
        //左侧
        while (i <= e1 && i <= e2) {
            console.log("左侧");
            console.log("i", i);
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                // 直到有一个不相同了,就结束左到右这个循环
                break;
            }
            // 左侧还是 从0 开始往右移动
            i++;
        }
        console.log("左侧结束:i,e1,e2", i, e1, e2);
        // 右侧
        while (i <= e1 && i <= e2) {
            console.log("右侧");
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                // 直到有一个不相同了,就结束右到左这个循环
                break;
            }
            // 右侧还是 从length  开始往左移动
            e1--;
            e2--;
        }
        console.log("右侧结束:i,e1,e2", i, e1, e2);
        // TODO  新的比老的多创建
        if (i > e1 && i <= e2) {
            console.log("新的比老的多创建");
            const nextPos = e2 + 1;
            const anchor = nextPos < l2 ? c2[nextPos].el : null;
            while (i <= e2) {
                patch(null, c2[i], container, parentComponent, anchor);
                i++;
            }
        }
        else if (i > e2) {
            // 老的比新的多创建
            console.log("老的比新的多创建");
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
    }
    function patchProps(oldProps, newProps, el) {
        // 更新props
        for (const key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                // 比较新旧props,如果不同,则更新
                hostPatchProp(el, key, prevProp, nextProp);
            }
        }
        for (const key in oldProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (!nextProp) {
                // 如果新props中没有该prop,则删除
                hostPatchProp(el, key, prevProp, nextProp);
            }
        }
    }
    // 函数mountComponent,用于处理组件
    function mountComponent(vnode, container, parentComponent, anchor) {
        //  创建组件实例
        const instance = createComponentInstance(vnode, parentComponent);
        // 完成对instance 的 初始化处理
        setupComponent(instance);
        //这里已经完成了vnode 的处理,--> 渲染实例
        setupRenderEffect(instance, vnode, container, anchor);
    }
    //  处理vnode ->  element
    function mountElement(n1, n2, container, parentComponent, anchor) {
        // const el = document.createElement(vnode.type);
        const el = hostCreateElement(n2.type);
        // 1. $el-> 挂在el
        n2.el = el;
        const { children, props, shapeFlag } = n2;
        // children
        // shapeFlag & ShapeFlags.STATEFUL_COMPONENT
        // if (typeof children === "string") {
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 文本节点
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent, anchor);
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
        hostInsert(el, container, anchor);
    }
    // 遍历children,调用patch函数处理每一个v,并将其添加到container中
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            // 调用patch函数处理v和container
            patch(null, v, container, parentComponent, anchor);
        });
    }
    // 遍历children,调用hostRemove函数移除每一个el
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    /* 组件类型( ShapeFlags.STATEFUL_COMPONENT ) 到这里时候 ,instance 初始化完成  (每一个组件的 初始 root )
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
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                // const subTree = instance.render(); // h()函数返回
                const subTree = (instance.subTree = instance.render.call(instance.proxy)); // h()函数返回
                patch(null, subTree, container, instance, anchor);
                // 2. $el-> 挂在el
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const prevSubTree = instance.subTree;
                const subTree = instance.render.call(instance.proxy);
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processTextVNode(n1, n2, container) {
        const el = document.createTextNode(n2.children);
        n2.el = el;
        container.append(el);
    }
    // TODO  createRenderer-01
    // createAppAPI 依赖render ,所以在这里调用获取render 的值
    // 方法1   return { render };
    // 方法2  return { createApp: createAppAPI(render) };
    return { createApp: createAppAPI(render) };
}

/* createRenderer 作用： 可以让用户 传入不同的
函数执行不同平台的api，
*/
// 创建一个函数，用于创建元素
function createElement(type) {
    // 返回创建的元素
    return document.createElement(type);
}
// 为元素el设置属性，key为属性名，val为属性值
function patchProp(el, key, prevProp, nextProp) {
    // 判断属性名是否以on开头
    const isOn = () => /^on[A-Z]/.test(key);
    // if (key.startsWith("on")) {
    // 如果是on开头，则将属性名转换为小写，并添加事件监听
    if (isOn()) {
        el.addEventListener(key.slice(2).toLowerCase(), nextProp);
    }
    else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key);
        }
        else {
            // 否则直接设置属性
            el.setAttribute(key, nextProp);
        }
    }
}
// 向父元素插入新元素
function insert(child, parent, anchor) {
    // parent.append(el);
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent)
        parent.removeChild(child);
}
function setElementText(el, text) {
    console.log("setElementText");
    el.textContent = text;
}
const renderObj = createRenderer({
    createElement,
    patchProp,
    insert,
    setElementText,
    remove
});
// TODO  createRenderer-01
/* // 方法1
  export function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 创建 vnode
        const vnode = createVNode(rootComponent);
        // 创建 dom
        renderObj.render(vnode, rootContainer);
      }
    };
  } */
/* // 方法2
export function createApp(...args) {
  return renderObj.createApp(...args);
} */
function createApp(...args) {
    return renderObj.createApp(...args);
}

// 定义RefImpl类
class RefImpl {
    constructor(value) {
        // 定义私有变量__v_isRef
        this.__v_isRef = true; //该属性在 isRef()时判断是否是ref
        this.rawValue = value;
        this._value = convert(value);
        // 将dep赋值为一个新的Set
        this.dep = new Set();
    }
    // 定义私有变量activeEffect
    // activeEffect  =this
    get value() {
        if (isTracking()) {
            trackEffects(this.dep);
        }
        // 返回_value
        return this._value;
    }
    set value(newValue) {
        // Object.is() 静态方法确定两个值是否为相同值。
        // hasChanged
        // if (!Object.is(this._value, newValue)) {
        if (hasChanged(newValue, this._value)) {
            this.rawValue = newValue;
            this._value = convert(newValue);
            // 执行依赖
            triggerEffects(this.dep);
        }
    }
}
//函数：convert，用于将传入的参数转换为响应式
function convert(value) {
    //判断传入的参数是否为对象
    return isObject(value) ? reactive(value) : value;
}
//函数：ref，用于创建一个RefImpl实例
function ref(value) {
    //创建一个RefImpl实例
    return new RefImpl(value);
}
//函数：isRef，用于判断传入的参数是否为RefImpl实例
function isRef(value) {
    //判断传入的参数是否有__v_isRef属性
    return !!value["__v_isRef"];
}
//函数：unRef，用于获取传入参数的值
function unRef(val) {
    return isRef(val) ? val.value : val;
}
// 导出一个函数，用于代理引用
function proxyRefs(objectWithRefs) {
    // 打印出objectWithRefs
    // console.log("proxyRefs", objectWithRefs);
    // 返回一个代理对象
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        // 设置属性值
        set(target, key, value) {
            // console.log('target,key,value',target,key,value);
            // 如果旧的值是ref 并且新的值不是ref
            if (isRef(target[key]) && !isRef(value)) {
                // 返回解引用后的值
                return (target[key].value = value);
            }
            else {
                // 返回反射设置的值
                return Reflect.set(target, key, value);
            }
        }
    });
}

exports.createApp = createApp;
exports.createElement = createElement;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
