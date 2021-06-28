"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const redisTool_1 = require("../util/redisTool");
const arrayTool_1 = require("../util/arrayTool");
class ApiService {
    async testRedis() {
        let res = await redisTool_1.redisDb0.setString("test", { hello: "hello" });
        let res2 = await redisTool_1.redisDb0.hset("testJson", "userName", "haha");
        let res3 = await redisTool_1.redisDb0.scan("*", 100);
        return res3;
    }
    async testArray() {
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
}
exports.ApiService = ApiService;
