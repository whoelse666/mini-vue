// 导出一个函数，用于判断传入的参数是否为对象
export function isObject(target) {
  // 判断传入的参数类型是否为object，且不为null
  return typeof target === "object" && target !== null;
}
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