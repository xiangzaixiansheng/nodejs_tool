"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
exports.post = post;
const axios_1 = __importDefault(require("axios"));
async function get(url, options, openLog = true) {
    return axios_1.default
        .get(url, options)
        .then((response) => {
        if (openLog) {
            console.error({
                data: response.data,
                url,
                method: "get",
                options,
            });
        }
        return response.data;
    })
        .catch((e) => {
        console.log(e);
        if (openLog) {
            console.error({
                data: e.message,
                url,
                method: "get",
                options,
            });
        }
    });
}
async function post(url, data, options, openLog = true) {
    return axios_1.default
        .post(url, data, options)
        .then((response) => {
        if (openLog) {
            console.info({ data: response.data, url, method: "post", options });
        }
        return response.data;
    })
        .catch((e) => {
        console.log(e);
        if (openLog) {
            console.error({
                data: e.message,
                url,
                method: "post",
                options,
            });
        }
    });
}
//# sourceMappingURL=requestTool.js.map