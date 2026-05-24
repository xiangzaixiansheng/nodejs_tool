"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqPostPromiseV2 = exports.reqPostPromise = exports.reqGetPromise = void 0;
const axios_1 = __importDefault(require("axios"));
const reqGetPromise = async (url, params, headers) => {
    try {
        const response = await axios_1.default.get(url, {
            params,
            headers,
        });
        return { status: 1, data: response.data };
    }
    catch (err) {
        return {
            status: 0,
            data: err?.response?.data || err.message,
            statusInfo: '请求失败',
        };
    }
};
exports.reqGetPromise = reqGetPromise;
const reqPostPromise = async (url, data, headers) => {
    try {
        const response = await axios_1.default.post(url, data, { headers });
        return { status: 1, data: response.data };
    }
    catch (err) {
        return {
            status: 0,
            data: err?.response?.data || err.message,
            statusInfo: '请求失败',
        };
    }
};
exports.reqPostPromise = reqPostPromise;
const reqPostPromiseV2 = async (options) => {
    try {
        const response = await (0, axios_1.default)(options);
        return { status: 1, data: response.data };
    }
    catch (err) {
        return {
            status: 0,
            data: err?.response?.data || err.message,
            statusInfo: '请求失败',
        };
    }
};
exports.reqPostPromiseV2 = reqPostPromiseV2;
//# sourceMappingURL=reqPromiseTool.js.map