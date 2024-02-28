class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  deps = [];
  onStop?: () => void;
  constructor(fn, scheduler) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    this.deps.forEach((dep: any) => {
      dep.delete(this);
    });
    if (this.onStop) this.onStop();
  }
}

type effectOptions = {
  scheduler?: Function;
};

export function effect(fn, options: effectOptions = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.onStop = options.onStop;
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
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
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
export function trigger(target, key, value) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  if (dep) {
    for (const effect of dep) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    }
  }
}
export function stop(runner) {
  runner.effect.stop();
}
