import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProviders = currentInstance.parent.provides;
    if (provides === parentProviders) {
      //初始化限制只在第一次是调用
      provides = currentInstance.provides = Object.create(parentProviders);
    }
    provides[key] = value;
    // currentInstance.provides[key] = value;
  }
}

//  inject 是从上层 取值（parent）,所以是要从parent上的 provides  取值
export function inject(key, defaultVal) {
  const currentInstance: any = getCurrentInstance();
  const parentProviders = currentInstance.parent.provides;
  if (!parentProviders[key]) {
    if (typeof defaultVal === "function") {
      return defaultVal();
    }
    return defaultVal;
  }
  return parentProviders[key];
}
