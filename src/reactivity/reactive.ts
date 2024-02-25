import { track, trigger } from "./effect";

export function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      // 收集依赖
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // fixme :这里需要注意执行顺序,先set 后再触发 
      const res = Reflect.set(target, key, value);
      // 执行依赖
      trigger(target, key, value);
      return res;
    }
  });
}
