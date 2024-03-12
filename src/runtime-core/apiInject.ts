import { getCurrentInstance } from "./component";



export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  currentInstance.providers[key] = value;
}

//  inject 是从上层 取值（parent）,所以是要从parent上的 providers  取值
export function inject(key) {
  const currentInstance: any = getCurrentInstance();
  const parentProviders = currentInstance.parent.providers;
  return parentProviders[key];
}
