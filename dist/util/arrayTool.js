"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayChunk = arrayChunk;
exports.arrayMove = arrayMove;
exports.sortBy = sortBy;
function arrayChunk(array, size = 1) {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
}
function arrayMove(array, from, to) {
    const startIndex = from < 0 ? array.length + from : from;
    if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = to < 0 ? array.length + to : to;
        const item = array.splice(from, 1)[0];
        if (item !== undefined) {
            array.splice(endIndex, 0, item);
        }
    }
    return array;
}
function sortBy(arr, kFn) {
    if (arr.length <= 1) {
        return arr;
    }
    const medianIndex = Math.floor(arr.length / 2);
    const medianValue = arr[medianIndex];
    if (medianValue === undefined) {
        return arr;
    }
    const left = [];
    const right = [];
    const getValue = kFn ?? ((v) => v);
    const medianKey = getValue(medianValue);
    for (let i = 0; i < arr.length; i++) {
        if (i === medianIndex) {
            continue;
        }
        const v = arr[i];
        if (v === undefined)
            continue;
        if (getValue(v) <= medianKey) {
            left.push(v);
        }
        else {
            right.push(v);
        }
    }
    return [...sortBy(left, kFn), medianValue, ...sortBy(right, kFn)];
}
//# sourceMappingURL=arrayTool.js.map