import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
import { isObject } from "./index";

class RefImpl {
  private _value: any;
  private rawValue: any;
  dep: Set<any>;
  constructor(value: any) {
    this.rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }
  // activeEffect  =this
  get value() {
    // 如果跟踪了，则跟踪效果
    if (isTracking()) {
      trackEffects(this.dep);
    }
    // 返回_value
    return this._value;
  }

  set value(newValue) {
    // Object.is() 静态方法确定两个值是否为相同值。
    if (!Object.is(this._value, newValue)) {
      this.rawValue = newValue;
      this._value = convert(newValue);
      // 执行依赖
      triggerEffects(this.dep);
      // return res;
    }
  }
}

function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}
