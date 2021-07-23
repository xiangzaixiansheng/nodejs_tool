"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const redisTool_1 = require("../util/redisTool");
const arrayTool_1 = require("../util/arrayTool");
const reqPromiseTool_1 = require("../util/reqPromiseTool");
const requestTool_1 = require("../util/requestTool");
class ApiService {
    async testRedis() {
        let res = await redisTool_1.redisDb0.setString("test", { hello: "hello" });
        let res2 = await redisTool_1.redisDb0.hset("testJson", "userName", "haha");
        let res3 = await redisTool_1.redisDb0.scan("*", 100);
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
        console.error(result1);
        console.error(result2);
        console.error(chunk);
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
}
exports.ApiService = ApiService;
