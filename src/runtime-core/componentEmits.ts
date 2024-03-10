import { camelize, capitalize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
  const { props } = instance;

  const getHump = camelize(event); //  提前处理  - 链接name  add-foo-> addFoo
  const handlerName = toHandlerKey(capitalize(getHump));
  const handle = props[handlerName];
  handle && handle(...args);
}
