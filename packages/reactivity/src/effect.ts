let activeEffect;
let shouldTrack;

export class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  deps = []; //stop 用到的数组
  active = true; // 是否为激活状态, stop  后为非激活
  onStop?: () => void;
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    //主动调用 runner 可以执行, 不用通过shouldTrack 判断
    if (!this.active) {
      return this._fn();
    }
    activeEffect = this;
    shouldTrack = true;
    // ComputedRefImpl-> get-02
    const res = this._fn();
    shouldTrack = false;
    return res;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      // shouldTrack = true;
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
  if (!isTracking()) {
    return;
  }
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
  /*   // 前置优化， 过滤重复activeEffect
  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep); */

  trackEffects(dep);
}
export function trigger(target, key, value) {
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

// 导出一个函数，用于停止runner
export function stop(runner) {
  // 停止runner的effect
  runner.effect.stop();
}

// 导出一个函数，用于判断是否处于追踪状态
export function isTracking() {
  // 判断shouldTrack和activeEffect是否都不为undefined
  return shouldTrack && activeEffect !== undefined;
}

// 导出一个函数trackEffect，用于跟踪效果
export function trackEffects(dep: Set<any>) {
  // 如果dep中已经存在activeEffect，则直接返回
  //
  if (dep.has(activeEffect)) return;
  // 否则，将value添加到dep中
  dep.add(activeEffect);
  // 将dep添加到activeEffect的依赖中
  activeEffect.deps.push(dep);
}

//   导出一个函数，用于触发效果
export function triggerEffects(dep) {
  // 遍历dep中的每一个效果
  for (const effect of dep) {
    // 如果effect中有调度器，则调用调度器
    // console.log("scheduler:如果effect中有调度器，则调用调度器");
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      // 否则，直接调用 effect.run
      effect.run();
    }
  }
};
