"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getType = getType;
exports.isNumber = isNumber;
exports.isFunction = isFunction;
function getType(value) {
    if (value == null) {
        return value === undefined ? 'Undefined' : 'Null';
    }
    return Object.prototype.toString
        .call(value)
        .replace(/^\[object\s/, '')
        .replace(/\]$/, '');
}
function isNumber(value) {
    return getType(value) === 'Number';
}
function isFunction(value) {
    return typeof value === 'function';
}
//# sourceMappingURL=typeTool.js.map