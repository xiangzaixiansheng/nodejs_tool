"use strict";
function getType(value) {
    const toString = Object.prototype.toString;
    if (value == null) {
        return value === undefined ? 'Undefined' : 'Null';
    }
    return toString
        .call(value)
        .replace(/^\[object/, '')
        .replace(/\]$/, '')
        .trim();
}
function isNumber(value) {
    return getType(value) === 'Number';
}
function isFunction(func) {
    return func && {}.toString.call(func) === '[object Function]';
}
