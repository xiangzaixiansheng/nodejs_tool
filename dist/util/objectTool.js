"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = deepCopy;
exports.isEmptyObject = isEmptyObject;
function deepCopy(obj) {
    var newobj = obj.constructor === Array ? [] : {};
    if (typeof obj !== 'object') {
        return obj;
    }
    else {
        for (var i in obj) {
            if (typeof obj[i] === 'object') {
                newobj[i] = deepCopy(obj[i]);
            }
            else {
                newobj[i] = obj[i];
            }
        }
    }
    return newobj;
}
function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}
//# sourceMappingURL=objectTool.js.map