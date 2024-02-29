import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false) {
  return function get(target, key) {
    console.log("target", target, isReadonly);

    /* 只要是proxy只要调用 就会触发getter,不论key 任何值;
   对于reactive 和readonly 参数isReadonly  判断
   所以可以给定isReactive , isReadonly  分别一个key   is_reactive  和  is_Readonly
    */
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    // 收集依赖
    if (!isReadonly) {
      track(target, key);
    }
    return Reflect.get(target, key);
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
