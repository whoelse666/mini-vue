// 导出一个函数，用于判断传入的参数是否为对象
const isObject = value => {
    // 判断传入的参数类型是否为object，且不为null
    return value !== null && typeof value === "object";
};

let targetMap = new Map();
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
Object.assign({}, readonlyHandlers, {
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

Promise.resolve();
