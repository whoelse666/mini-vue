import { isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { ReactiveFlags,  reactive, readonly } from "./reactive";

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
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
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
    trigger(target, key, value);
    return res;
  };
}

// function readonlyCreateSetter() {
//   return function set(target) {
//     console.warn(`${target} is readonly`);
//     return true;
//   };
// }

export const mutableHandlers = {
  get,
  set
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
    return true;
  }
};

export const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
  get: shallowReadonlyGet
});

// export const shallowReadonlyHandlers = {
//   get: shallowReadonlyGet,
//   set(target, key) {
//     console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
//     return true;
//   }
// };
