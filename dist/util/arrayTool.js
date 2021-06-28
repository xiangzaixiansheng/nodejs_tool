"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortBy = exports.arrayMove = exports.arrayChunk = void 0;
function arrayChunk(array, size = 1) {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
}
exports.arrayChunk = arrayChunk;
function arrayMove(array, from, to) {
    const startIndex = from < 0 ? array.length + from : from;
    if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = to < 0 ? array.length + to : to;
        const [item] = array.splice(from, 1);
        array.splice(endIndex, 0, item);
    }
    return array;
}
exports.arrayMove = arrayMove;
function sortBy(arr, kFn = (v) => v) {
    if (arr.length <= 1) {
        return arr;
    }
    const medianIndex = Math.floor(arr.length / 2);
    const medianValue = arr[medianIndex];
    const left = [];
    const right = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        if (i === medianIndex) {
            continue;
        }
        const v = arr[i];
        if (kFn(v, i, arr) <= kFn(medianValue, i, arr)) {
            left.push(v);
        }
        else {
            right.push(v);
        }
    }
    return sortBy(left, kFn).concat([medianValue]).concat(sortBy(right, kFn));
}
exports.sortBy = sortBy;
