function add(a, b) {
    console.log('a,b', a, b);
    return a + b;
}
function isObject(target) {
    return typeof target === "object" && target !== null;
}

export { add, isObject };
