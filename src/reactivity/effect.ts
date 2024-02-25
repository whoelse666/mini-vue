class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}

export function effect(fn) {
  console.log("effect test");
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

let activeEffect;
let targetMap = new Map();
export function track(target, key) {
  console.log("target,key", target, key);
  console.log("activeEffect", activeEffect);

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
  dep.add(activeEffect);
}

export function trigger(target, key, value) {
  console.log("trigger", target, key, value);
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  if (dep) {
    for (const effect of dep) {
      effect.run();
    }
  }
}
