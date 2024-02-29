let activeEffect;
let shouldTrack;

class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  deps = []; //stop 用到的数组
  active = true; // 是否为激活状态, stop  后为非激活
  onStop?: () => void;
  constructor(fn, scheduler) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    //主动调用 runner 可以执行, 不用通过shouldTrack 判断
    if (!this.active) {
      return this._fn();
    }
    activeEffect = this;
    shouldTrack = false;

    return this._fn();
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      shouldTrack = true;
      if (this.onStop) {
        // stop 的回调函数
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

type effectOptions = {
  scheduler?: Function;
  onStop?: () => void;
};

export function effect(fn, options: effectOptions = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.onStop = options.onStop;
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

let targetMap = new Map();
export function track(target, key) {
  if (shouldTrack) {
    return;
  }
  if (!activeEffect) return;
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
