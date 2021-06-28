"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = void 0;
const wrap = (task) => {
    return new Promise((resolve, reject) => {
        task.then((data) => {
            resolve({
                statusCode: 200,
                data,
            });
        }).catch(err => {
            resolve({
                statusCode: -100,
                msg: err.message
            });
        });
    });
};
exports.wrap = wrap;
