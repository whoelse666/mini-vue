export function add(a, b) {
  console.log('a,b', a, b);
  return a+b
}
export function isObject(target) {
  return typeof target === "object" && target !== null;
}