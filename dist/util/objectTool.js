"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = deepCopy;
exports.isEmptyObject = isEmptyObject;
function deepCopy(obj) {
    return structuredClone(obj);
}
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}
//# sourceMappingURL=objectTool.js.map