"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqPostPromise = exports.reqGetPromise = void 0;
const request_promise_1 = __importDefault(require("request-promise"));
var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');
const reqGetPromise = async (uri, qs, headers) => {
    return new Promise((resolve, reject) => {
        var bufferHelper = new BufferHelper();
        request_promise_1.default({
            uri,
            qs,
            encoding: null,
            headers: headers ? {
                'User-Agent': 'Request-Promise',
            } : headers,
            json: true
        }).then(data => {
            if (Buffer.isBuffer(data)) {
                bufferHelper.concat(data);
                var decode = iconv.decode(bufferHelper.toBuffer(), 'utf-8');
                return resolve(decode);
            }
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
};
exports.reqGetPromise = reqGetPromise;
async function reqPostPromise(uri, params, headers) {
    return request_promise_1.default({
        method: 'POST',
        uri,
        body: params,
        headers: headers ? {
            'Content-type': 'application/json'
        } : headers,
        json: true
    }).then(data => {
        return { status: 1, data };
    }).catch(err => {
        return {
            status: 0,
            data: err,
            statusInfo: '未知错误!'
        };
    });
}
exports.reqPostPromise = reqPostPromise;
