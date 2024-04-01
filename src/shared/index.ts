// 导出一个函数，用于判断传入的参数是否为对象
export function isObject(target) {
  // 判断传入的参数类型是否为object，且不为null
  return typeof target === "object" && target !== null;
}


export const isString = value => typeof value === "string";


// 导出一个函数，用于判断传入的参数是否包含指定的属性
export const hasChanged = (val, newValue) => {
  // 判断传入的参数是否改变
  return !Object.is(val, newValue);
};

// 导出一个函数，用于判断传入的参数是否包含指定的属性
export const hasOwn = (target, key) => {
  // 判断传入的参数是否为对象
  if (!isObject(target)) {
    // 如果不是对象，则报错
    console.log(`target 不是对象`);
    return false;
  }
  // 返回传入的参数是否包含指定的属性
  return Object.prototype.hasOwnProperty.call(target, key);
};

// 将字符串转换为大写
export function capitalize(str: any) {
  // 将字符串的第一个字符转换为大写
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 将字符串转换为驼峰式
export function toHandlerKey(str: any) {
  // 将字符串转换为on开头，后面接大写字母
  return str ? "on" + str : "";
}

// 将字符串转换为驼峰式
export function camelize(event) {
  // 将字符串中的-替换为空字符，并将第一个字符转换为大写
  const res = event.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
  return res;
}