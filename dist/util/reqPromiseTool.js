"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqPostPromise = void 0;
const request_promise_1 = __importDefault(require("request-promise"));
function reqGetPromise(uri, qs) {
    return new Promise((resolve, reject) => {
        request_promise_1.default({
            uri,
            qs,
            encoding: null,
            headers: {
                'User-Agent': 'Request-Promise',
            },
            json: true
        }).then(data => {
            resolve(data);
        }, err => {
            let errData = {
                status: 0,
                data: err,
                statusInfo: '失败'
            };
            reject(errData);
        }).catch(err => {
            let obj = {
                status: 0,
                data: err,
                statusInfo: '未知错误！'
            };
            reject(obj);
        });
    });
}
function reqPostPromise(uri, params) {
    return request_promise_1.default({
        method: 'POST',
        uri,
        body: params,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    }).then(data => {
        return data;
    }).catch(err => {
        return {
            status: 0,
            data: err,
            statusInfo: '未知错误!'
        };
    });
}
exports.reqPostPromise = reqPostPromise;
