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
        component: null,
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
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
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

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    if (typeof slots[name] === "function") {
        return createVNode(Fragment, {}, slots[name](props));
    }
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
// 导出一个函数，用于停止runner
function stop(runner) {
    // 停止runner的effect
    runner.effect.stop();
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
        // 如果effect中有调度器，则调用调度器
        // console.log("scheduler:如果effect中有调度器，则调用调度器");
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            // 否则，直接调用 effect.run
            effect.run();
        }
    }
}

function toDisplayString(value) {
    return String(value);
}

// 导出一个函数，用于判断传入的参数是否为对象
const isObject = value => {
    // 判断传入的参数类型是否为object，且不为null
    return value !== null && typeof value === "object";
};
const isString = value => typeof value === "string";
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
// 导出一个函数，用于判断传入的值是否为响应式
function isReactive(value) {
    // 返回传入值的响应式标志位
    return !!value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
// 导出一个函数，用于判断传入的值是否为只读
function isReadonly(value) {
    // 返回传入值的ReactiveFlags.IS_READONLY属性值
    // TODO 到测试 不使用 !! 单测不过 bug  对应->  ( isReadonly-01 )
    //  return value[ReactiveFlags.IS_READONLY];
    return !!value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
// 导出一个函数，用于判断传入的值是否为代理 isProxy 就是包含了isReactive 和  isReadonly ,满足一个即可🧍‍♀️
function isProxy(value) {
    // 判断传入的值是否为响应式或者只读
    return isReactive(value) || isReadonly(value);
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
    $el: i => i.vnode.el,
    $slots: i => i.slots,
    $props: i => i.props
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
        next: null,
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
    finishComponentSetup(instance);
}
// finishComponentSetup;
// 函数finishComponent接收一个参数instance，用于完成组件
function finishComponentSetup(instance) {
    /*   // 如果instance的type属性有render方法，则将instance的render属性设置为instance的type属性的render方法
    if (instance.type.render) {
      //  把 render 提高结构层级,简化调用
      instance.render = instance.type.render;
    } */
    const Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
            console.log("Component.render ", Component.render);
        }
    }
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
/* 在setup 中执行getCurrentInstance 获取当前实例后重置为null ,所以在setup()前后设置instance  和重置  */
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
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

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
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

const p = Promise.resolve();
const queue = [];
function nextTick(fn) {
    console.log("nextTick");
}
/*
args   job ===  instance.update === effect.run
*/
// 导出一个函数，用于队列作业
function queueJobs(job) {
    // 如果没有包含该作业，则将其推入队列
    if (!queue.includes(job)) {
        // 收集effect的run方法
        queue.push(job);
    }
    queueFlush();
}
let isFlushPending = false;
// 定义一个清空队列的函数
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    //  类似防抖功能原理
    // 进到这里后 就会把这个为任务加到队列中，等待同步任务执行完后 开始执行异步任务
    flushJobs();
}
function flushJobs() {
    p.then(() => {
        // 执行到这里后，重置 isFlushPending 为 false，表示当前没有在执行队列中的任务
        isFlushPending = false;
        let job;
        console.log("queue.length", queue.length);
        //  queue.shift() 返回 队列中的第一个作业，并将其从队列中删除
        while ((job = queue.shift())) {
            job && job();
        }
    });
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
                processText(n1, n2, container);
                break;
            default:
                // if (typeof vnode.type === "string") {
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                    //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }
    // 函数processComponent,用于处理组件
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 调用mountComponent函数处理vnode和container
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            // 更新组件
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
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
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        // 获取旧props
        const oldProps = n1.props || {};
        // 获取新props
        const newProps = n2.props || {};
        // 更新组件的el
        const el = (n2.el = n1.el);
        console.log("n1,n2", n1, n2);
        // 比较n1和n2,并调用patchChildren函数
        patchChildren(n1, n2, el, parentComponent, anchor);
        // 更新组件的props
        patchProps(el, oldProps, newProps);
    }
    // 比较新旧节点,完成 渲染更新
    function patchChildren(n1, n2, container, parentComponent, anchor) {
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
            }
            if (c1 !== c2) {
                // 设置新的元素文本
                // hostSetElementText(container, n2.children);
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
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length;
        let i = 0, 
        //  新老节点索引
        e1 = c1.length - 1, e2 = l2 - 1;
        // 判断两个虚拟节点是否相同
        function isSameVNodeType(n1, n2) {
            // 判断两个虚拟节点的类型和key是否相同
            return n1.type === n2.type && n1.key === n2.key;
        }
        //左侧
        while (i <= e1 && i <= e2) {
            // console.log("左侧");
            // console.log("i", i);
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                // 直到有一个不相同了,就结束左到右这个循环
                console.log("左侧直到不同位置- 结束:i,e1,e2", i, e1, e2);
                break;
            }
            // 左侧开始 从0 开始往右移动
            i++;
        }
        console.log("左侧结束:i,e1,e2", i, e1, e2);
        // 右侧
        while (i <= e1 && i <= e2) {
            // console.log("右侧");
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                // 直到有一个不相同了,就结束右到左这个循环
                console.log("右侧直到不同位置- 结束:i,e1,e2", i, e1, e2);
                break;
            }
            // 右侧开始 从length  开始往左移动
            e1--;
            e2--;
        }
        console.log("右侧结束:i,e1,e2", i, e1, e2);
        // TODO  新的比老的多创建, 只有新增,无位移
        if (i > e1) {
            if (i <= e2) {
                // 判断条件执行到这里,老的节点已经全部跑完,剩下的是只有新的才有的节点,所以都要新创建
                // console.log("新的比老的多创建");
                const nextPos = i;
                // const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 老的比新的多删除 , 无位移
            // console.log("老的比新的多删除");
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // console.log("中间对比");
            const s1 = i, s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            // 1. 基于新的 创建 key 映射表,然后循环老的,每一个key 去keyToNewIndexMap 中找,没有的话,就可能为删除(用户传入可能会没有填写key)
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
            let moved = false, maxNewIndexSoFar = 0;
            // 遍历 c2 数组,将 s2 和 e2 之间的元素添加到 keyToNewIndexMap 中
            for (let i = s2; i <= e2; i++) {
                // 创建 新的tree 的 map 映射
                // 获取 c2 数组中 i 位置的元素
                const nextChild = c2[i];
                // 将 nextChild 的 key 和 i 添加到 keyToNewIndexMap 中
                keyToNewIndexMap.set(nextChild.key, i);
            }
            // 这里的 s1  此时是 去除首尾部分相同节点后索引位置
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                // 优化: 新的已经全部比对完,旧的还有,不用继续循环,就删除
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    // 有key 的比对
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    // 没有key 的比对
                    for (let j = s2; j <= e2; j++) {
                        // 循环新的, 一一去和旧prevChild的比对,节点是否新老都存在
                        if (isSameVNodeType(prevChild, c2[j])) {
                            // nextINdex 的值是新的节点循环 的 索引,相对于完整列表的索引
                            newIndex = j;
                            // 找到后就立马结束 , 避免不必要的循环
                            break;
                        }
                    }
                }
                // 以上处理都结束后 nextIndex 还是没有的话 ,就要删除
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // nextIndex - s2 相对于去除首位相同部分,截取中间部分数组 ,在取的索引
                    // newIndex 是新老都有的节点,在新的节点数组里的完整的索引
                    // i 是 老的节点数组的完整索引
                    //这里的赋值 是新旧节点位置索引的隐射关系, i 是获取相对位置关系,i + 1 防止i==0 情况,整体都+ 1 不会影响相对的位置关系;
                    /* fixme :  i 可能是0 ,但是newIndexToOldIndexMap初始化给的值就是 0 ,再给  newIndexToOldIndexMap[x] = 0 在这里就没有意义,所以默认 统一 i+1 防止i == 0 情况 */
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            // 获取新索引序列,如果移动了则从新索引到旧索引映射中获取,否则为空
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            // 反序列循环,是因为需要依赖于后一个节点,insertBefore 插入节点
            let j = increasingNewIndexSequence.length - 1;
            // 遍历中间部分,需要更新的节点 toBePatched = e2-s2+1
            for (let i = toBePatched - 1; i >= 0; i--) {
                // 获取下一个节点的索引
                const nextIndex = s2 + i;
                // 获取下一个节点
                const nextChild = c2[nextIndex];
                // 获取下一个节点的锚点
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                // 如果新旧索引映射表中该位置的值为0,老节点中没有这个节点,新节点中有,则创建新节点
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    // 如果j小于0或者i不等于增加的新索引序列中的j,则插入新节点
                    //  j < 0 则 最长递增自序列 已经执行完,剩下的就都是要移动的
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log("移动位置", i, increasingNewIndexSequence[j], nextChild, anchor);
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        //  新老都有,并且位置相对位置不变(最长递增自序列)
                        j--;
                    }
                }
            }
        }
    }
    function patchProps(el, oldProps, newProps) {
        // 更新props 循环新的,比较新旧是否相同
        for (const key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                // 比较新旧props,如果不同,则更新
                hostPatchProp(el, key, prevProp, nextProp);
            }
        }
        // 循环旧的 判断旧的有,新的没有的属性,删除
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
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        //  创建组件实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        // 完成对instance 的 初始化处理
        setupComponent(instance);
        //这里已经完成了vnode 的处理,--> 渲染实例
        console.log("instance", instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
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
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // instance.render.call(proxy, proxy)   -> 第二个proxy 作为第一个参数_ctx 传递   render(_ctx, _cache, $props, $setup, $data, $options)
                // const subTree = instance.render(); // h()函数返回
                const subTree = (instance.subTree = instance.render.call(proxy, proxy)); // h()函数返回
                patch(null, subTree, container, instance, anchor);
                // 2. $el-> 挂在el
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { next, vnode, proxy } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const prevSubTree = instance.subTree;
                const subTree = instance.render.call(proxy, proxy);
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            //  当effect 执行的时候,如果options中有scheduler,则执行scheduler,不执行fn,fn需要手动执行
            scheduler() {
                queueJobs(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVNode) {
        console.log("instance, next", instance, nextVNode);
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    //函数processFragment,用于处理片段,参数n1,n2,container,parentComponent,anchor
    function processFragment(n1, n2, container, parentComponent, anchor) {
        //调用mountChildren函数,传入n2的children,container,parentComponent,anchor
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    // 功能:处理文本节点
    // 参数:n1:文本节点1;n2:文本节点2;container:容器
    function processText(n1, n2, container) {
        // 创建文本节点
        const el = (n2.el = document.createTextNode(n2.children));
        // 将文本节点添加到容器中
        container.append(el);
    }
    // TODO  createRenderer-01
    // createAppAPI 依赖render ,所以在这里调用获取render 的值
    // 方法1   return { render };
    // 方法2  return { createApp: createAppAPI(render) };
    return { createApp: createAppAPI(render) };
}
//最长递增自序列 算法 函数getSequence接收一个数组arr,返回一个排序后的数组
function getSequence(arr) {
    // 复制arr数组,并赋值给p
    const p = arr.slice();
    // 定义一个结果数组,第一个元素为0
    const result = [0];
    // 定义i,j,u,v,c变量
    let i, j, u, v, c;
    // 获取arr数组的长度
    const len = arr.length;
    // 遍历arr数组
    for (i = 0; i < len; i++) {
        // 获取arr数组中第i个元素
        const arrI = arr[i];
        // 如果arr数组中第i个元素不为0
        if (arrI !== 0) {
            // 获取result数组中最后一个元素,赋值给j
            j = result[result.length - 1];
            // 如果arr数组中第j个元素小于arr数组中第i个元素
            if (arr[j] < arrI) {
                // 将arr数组中第i个元素的值赋值给p数组中第i个元素
                p[i] = j;
                // 将i的值添加到result数组中
                result.push(i);
                // 继续遍历arr数组
                continue;
            }
            // 定义u和v变量
            u = 0;
            v = result.length - 1;
            // 当u小于v时,执行循环
            while (u < v) {
                // 计算u和v的中间值,赋值给c
                c = (u + v) >> 1;
                // 如果arr数组中第result数组中第c个元素小于arr数组中第i个元素
                if (arr[result[c]] < arrI) {
                    // 将u的值加1
                    u = c + 1;
                }
                else {
                    // 否则将v的值赋值给c
                    v = c;
                }
            }
            // 如果arr数组中第result数组中第u个元素小于arr数组中第i个元素
            if (arrI < arr[result[u]]) {
                // 如果u大于0,将arr数组中第result数组中第u-1个元素的值赋值给p数组中第i个元素
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                // 将i的值赋值给result数组中第u个元素
                result[u] = i;
            }
        }
    }
    // 获取result数组的长度
    u = result.length;
    // 获取result数组中最后一个元素,赋值给v
    v = result[u - 1];
    // 当u大于0时,执行循环
    while (u-- > 0) {
        // 将v的值赋值给result数组中第u个元素
        result[u] = v;
        // 将arr数组中第v个元素的值赋值给v
        v = p[v];
    }
    // 返回result数组
    return result;
}

/* createRenderer 作用： 可以让用户 传入不同的
函数执行不同平台的api，
*/
// export { registerRuntimeCompiler } from "@mini-vue/runtime-core";
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
// 向父元素插入新元素  , 移动位置
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

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createElement: createElement,
    createElementVNode: createVNode,
    createRenderer: createRenderer,
    createTextVNode: createTextVNode,
    effect: effect,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    insert: insert,
    isProxy: isProxy,
    isReactive: isReactive,
    isReadonly: isReadonly,
    isRef: isRef,
    nextTick: nextTick,
    patchProp: patchProp,
    provide: provide,
    proxyRefs: proxyRefs,
    reactive: reactive,
    readonly: readonly,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler,
    renderSlots: renderSlots,
    shallowReadonly: shallowReadonly,
    stop: stop,
    toDisplayString: toDisplayString,
    unRef: unRef
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
// export const OPEN_BLOCK = Symbol("openBlock");
const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    // [OPEN_BLOCK]: "openBlock",
    [CREATE_ELEMENT_VNODE]: "createElementVNode"
};

// 拼接 在codegen.ts,数据结构转换在transform.ts
function generate(ast) {
    // 创建一个上下文
    const context = createCodegenContext();
    // 获取上下文的push方法
    const { push } = context;
    const fnName = " render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(",");
    genFunctionPreamble(ast, context);
    push(`function ${fnName}( ${signature}){`);
    // push("\n");
    push(" return ");
    genNode(ast.codegenNode, context);
    // push("\n");
    push("}");
    return context;
}
// 处理导入 模块的函数  const { toDisplayString: _toDisplayString } = Vue
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const VueBinging = "Vue";
    const aliasHelper = s => `${helperMapName[s]}:_${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        // 推送helper的格式化结果
        push(`const { ${ast.helpers.map(aliasHelper)}} = ${VueBinging} `);
        push("\n");
    }
    push(" return ");
}
// 创建一个代码生成上下文
function createCodegenContext() {
    // 创建一个上下文对象,用于存储代码生成上下文
    const context = {
        code: "",
        // 实现push方法,用于将源代码添加到上下文中
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
            // return `_${helperMapName[key]}`;
        }
    };
    // 返回上下文对象
    return context;
}
// 生成节点函数
function genNode(node, context) {
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function genCompoundExpression(node, context) {
    const { push } = context;
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            //  中间加入的  " + "
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
/*
const { toDisplayString: _toDisplayString, openBlock: _openBlock, createElementBlock: _createElementBlock } = Vue
return function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", null, "hi," + _toDisplayString(_ctx.message)))
}
*/
function genElement(node, context) {
    const { push, helper } = context;
    const { children, tag, props } = node;
    // const child = children[0];
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props, children]), context);
    /*   push(`${helper(CREATE_ELEMENT_VNODE)}(${tag},${props},`);
    // 处理后符合类型只有一个children， 真实的children 在 children[0]里面
    children && genNode(children, context); */
    /*   for (let i = 0; i < children.length; i++) {
      const child = children[i];
      genNode(child, context);
      // if (i < children.length - 1) {
      //   push("+");
      // }
    } */
    push(")");
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if ( /* !node || */isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(",");
        }
    }
}
function genNullable(args) {
    return args.map(arg => arg || "null");
}
function genExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
// 插值类型
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
// 文本类型
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}

function baseParse(content) {
    // 处理数据结构  {    source: content   };
    const context = createParserContext(content);
    const res = parseChildren(context, []);
    // 处理数据结构  { children:[{    source: content   }]};
    return createRoot(res);
}
// 解析子节点
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source;
        // 如果代码以 {{ 开始
        if (s.startsWith("{{")) {
            // 解析插值表达式
            node = parseInterpolation(context);
        }
        else if (s[0] === "<") {
            // 检查字符串s的第二个字符是否为小写字母
            if (/[a-z]/i.test(s[1])) {
                // 如果是，则调用parseElement函数，获取新的node节点
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            // 解析文本节点
            node = parseText(context);
        }
        // 将节点推入nodes数组
        nodes.push(node);
    }
    // 返回nodes数组
    return nodes;
}
function isEnd(context, ancestors) {
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
        return true;
    }
    return !s;
}
// 函数startsWithEndTagOpen()用于检查字符串source是否以tag结尾
function startsWithEndTagOpen(source, tag) {
    // 如果source以</开头，并且tag的大小写与source中slice(2, 2 + tag.length)的大小写相等
    if (source.startsWith("</") && tag.toLowerCase() === source.slice(2, 2 + tag.length).toLowerCase()) {
        // 返回true
        return true;
    }
}
// 解析文本
function parseText(context) {
    let endIndex = context.source.length;
    let endTokens = ["<", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    // 从上下文中提取内容
    const content = parseTextData(context, endIndex);
    // 返回文本节点
    return {
        type: 3 /* NodeTypes.TEXT */,
        content
    };
}
// 提取文本数据
function parseTextData(context, length) {
    // 提取源代码的前length个字符
    const content = context.source.slice(0, length);
    // 移动指针
    advanceBy(context, length);
    // 返回文本数据
    return content;
}
// 函数parseElement,接收两个参数context和arg1,返回值any
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        // 匹配开始标签<div>后，还有去除关闭标签</div>
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function parseTag(context, type) {
    // const match: any = /^<\/?([a-z]+\w*)/i.exec(context.sources);
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    // 移动光标 ,已经处理的就删除了,  match[0].length + 1 的  +1 是要再加 > d的一个位置
    advanceBy(context, match[0].length + 1);
    /*   advanceBy(context, match[0].length);
      advanceBy(context, 1); */
    if (type === 1 /* TagType.End */)
        return;
    return { type: 2 /* NodeTypes.ELEMENT */, tag: tag };
}
// 解析插值表达式
function parseInterpolation(context) {
    // 定义开始标签和结束标签
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    // 记录开始标签标签的长度
    let openDelimiterLength = openDelimiter.length;
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiterLength);
    // 移动光标 ,已经处理的就删除了
    advanceBy(context, openDelimiterLength);
    const rawContentLength = closeIndex - openDelimiterLength;
    // 获取内容部分 , 去除'{{' 部分
    const rawContent = parseTextData(context, rawContentLength);
    // 去除空格
    const content = rawContent && rawContent.trim();
    advanceBy(context, closeDelimiter.length);
    return {
        // 子节点的类型为 NodeTypes.INTERPOLATION
        type: 0 /* NodeTypes.INTERPOLATION */,
        // 内容为一个对象,包含 type 和 content 属性
        content: {
            // type 属性为 NodeTypes.SIMPLE_EXPRESSION
            type: 1 /* NodeTypes.SIMPLE_EXPRESSION */,
            // content 属性为 "message"
            content: content
        }
    };
}
// 函数advanceBy,功能:从给定的any类型的context中截取长度为length的字符串
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
// 函数createRoot,功能:创建一个具有children属性root
function createRoot(children) {
    return {
        children,
        type: 4 /* NodeTypes.ROOT */
    };
}
// 创建解析上下文
function createParserContext(content) {
    return {
        source: content
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
// 给 createRootCodegen 函数添加中文注释
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === 2 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        // 将 root 的第一个子节点设置为 root.codegenNode
        root.codegenNode = root.children[0];
    }
}
// 定义函数createTransformContext，用于创建一个转换上下文
function createTransformContext(root, options) {
    // 返回一个对象，包含根节点root和节点转换列表nodeTransforms
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}
// 遍历节点
function traverseNode(node, context) {
    const { nodeTransforms } = context;
    const exitFns = [];
    // 遍历节点转换器
    for (let i = 0; i < nodeTransforms.length; i++) {
        // todo ：    nodeTransforms === [transformExpression,  transformElement, transformText ]
        // const transform = nodeTransforms[i];
        const nodeTransform = nodeTransforms[i];
        if (nodeTransform) {
            const onExit = nodeTransform(node, context);
            onExit && exitFns.push(onExit);
        }
    }
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
        case 2 /* NodeTypes.ELEMENT */:
            traverseChildren(node, context);
            // traverseChildren(node.children, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
// 遍历子节点
function traverseChildren(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}

function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag,
        props,
        children
    };
}

function transformElement(node, context) {
    return () => {
        if (node.type === 2 /* NodeTypes.ELEMENT */) {
            // note context.helper()  ===  context.helpers.set(key, 1); helpers: new Map()
            const vnodeTag = `'${node.tag}'`;
            let vnodeProps = null;
            const vnodeChildren = node.children[0];
            /*
              context.helper(CREATE_ELEMENT_VNODE);
          const vnodeElement = {
                type: NodeTypes.ELEMENT,
                tag: vnodeTag,
                props: vnodeProps,
                children: vnodeChildren
              };
              node.codegenNode = vnodeElement; */
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        }
    };
}

function transformExpression(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */;
}
/*   处理符合类型，将 children 在多包一层  {
                type: NodeTypes.COMPOUND_EXPRESSION,
                children: [child]
              }; */
function transformText(node, context) {
    return () => {
        if (node.type === 2 /* NodeTypes.ELEMENT */) {
            const { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(" + ", next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = null;
                            break;
                        }
                    }
                }
            }
        }
    };
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText]
    });
    return generate(ast);
}

// 这个文件充当 vue 模块
function compileToFunction(template, options = {}) {
    const { code } = baseCompile(template);
    // 调用 compile 得到的代码在给封装到函数内，
    // 这里会依赖 runtimeDom 的一些函数，所以在这里通过参数的形式注入进去
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.createApp = createApp;
exports.createElement = createElement;
exports.createElementVNode = createVNode;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.nextTick = nextTick;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.toDisplayString = toDisplayString;
exports.unRef = unRef;
