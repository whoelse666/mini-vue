'use strict';

function add(a, b) {
    console.log('a,b', a, b);
    return a + b;
}
function isObject(target) {
    return typeof target === "object" && target !== null;
}

exports.add = add;
exports.isObject = isObject;
