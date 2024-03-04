import { ReactiveEffect, effect } from "./effect";

class ComputedRefImpl {
  private _value: any;
  private _getter: any;
  private _dirty: boolean = true;
  private _effect;
  constructor(getter) {
    this._getter = getter;
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    // 这里 先用暴力法,限制getter 不能重复调用
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    console.log("this._value===", this._value);
    return this._value;
  }

  // set value(newValue) {
  //   this._value = newValue;
  // }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
