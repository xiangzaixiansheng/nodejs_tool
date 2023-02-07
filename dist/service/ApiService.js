"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const redisTool_1 = require("../util/redisTool");
const arrayTool_1 = require("../util/arrayTool");
const reqPromiseTool_1 = require("../util/reqPromiseTool");
const requestTool_1 = require("../util/requestTool");
const logger_1 = require("../util/logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ApiService {
    async testRedis() {
        await redisTool_1.redis_tool.setString("test", { hello: "hello" });
        await redisTool_1.redis_tool.hset("testJson", "userName", "haha");
        let res3 = await redisTool_1.redis_tool.scan("*", 100);
        return res3;
    }
    async testArray(query) {
        if (query && query.array) {
            return arrayTool_1.sortBy(query.array.split(","));
        }
        let testArray = [8, 9, 2, 1, 0, 6];
        let result1 = arrayTool_1.sortBy(testArray);
        let result2 = arrayTool_1.sortBy(testArray, (item) => -item);
        let chunk = arrayTool_1.arrayChunk(testArray, 3);
        logger_1.logger.error(result1);
        logger_1.logger.error(result2);
        logger_1.logger.error(chunk);
        class Student {
            constructor(name, age) {
                this.name = name;
                this.age = age;
            }
        }
        let arr = [
            new Student('xiangzai', 22),
            new Student('liming', 19),
            new Student('hantian', 33),
        ];
        const sFn = (student) => student.age;
        console.error(arrayTool_1.sortBy(arr, sFn));
        console.error(arrayTool_1.sortBy(arr, (i) => -sFn(i)));
        return "success";
    }
    async testRequestV1() {
        let res = await reqPromiseTool_1.reqGetPromise("http://localhost:8080/api/testArray", { array: "8,9,2,1,3,4", data: "123" });
        let res2 = await requestTool_1.get("http://localhost:8080/api/testArray", { params: { array: "8,9,2,1,3,4", data: "123" } });
        return res2;
    }
    async uploadFileByStream(ctx) {
        const file = ctx.request.files.file;
        const fileReader = fs.createReadStream(file.path);
        const filePath = path.join(__dirname, '../uploads/stream');
        const fileResource = filePath + `/${file.name}`;
        const writeStream = fs.createWriteStream(fileResource);
        if (!fs.existsSync(filePath)) {
            await fs.promises.mkdir(filePath, { recursive: true });
        }
        fileReader.pipe(writeStream);
        return "success";
    }
}
exports.ApiService = ApiService;
