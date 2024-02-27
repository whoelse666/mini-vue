class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  constructor(fn, options) {
    this._fn = fn;
    this.scheduler = options.scheduler;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
}

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, options);
  if (options?.scheduler) {
    return options?.scheduler;
  } else {
    _effect.run();
  }
  const runner = _effect.run.bind(_effect);
  return runner;
}

let activeEffect;
let targetMap = new Map();
export function track(target, key) {
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
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  if (dep) {
    for (const effect of dep) {
      effect.run();
    }
  }
}
