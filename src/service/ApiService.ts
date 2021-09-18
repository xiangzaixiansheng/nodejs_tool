import { redis_tool } from '../util/redisTool';
import { sortBy, arrayChunk } from '../util/arrayTool';
import { reqGetPromise } from '../util/reqPromiseTool';
import { get } from '../util/requestTool';
import { logger } from '../util/logger';

export class ApiService {

    /**
     * @description redis_tool 测试读写redis
     * @returns 
     */
    public async testRedis() {
        //测试set
        await redis_tool.setString("test", { hello: "hello" });
        //测试hset和加锁
        await redis_tool.hset("testJson", "userName", "haha");
        //测试scan方法
        let res3 = await redis_tool.scan("*", 100);
        return res3;
    }

    /**
     * @description arrayTool 测试数组相关的
     * @param query 
     * @returns 
     */
    public async testArray(query?: any) {
        if (query && query.array) {
            return sortBy(query.array.split(","));
        }

        let testArray = [8, 9, 2, 1, 0, 6];
        let result1 = sortBy(testArray);
        let result2 = sortBy(testArray, (item) => -item); //倒序
        let chunk = arrayChunk(testArray, 3); //[ [ 8, 9, 2 ], [ 1, 0, 6 ] ]

        logger.error(result1);
        logger.error(result2);
        logger.error(chunk);

        class Student {
            public name: any
            public age: any

            constructor(name: string, age: number) {
                this.name = name
                this.age = age
            }
        }

        let arr = [
            new Student('xiangzai', 22),
            new Student('liming', 19),
            new Student('hantian', 33),
        ]
        const sFn = (student: Student) => student.age
        console.error(sortBy(arr, sFn)) //age从小到大
        console.error(sortBy(arr, (i) => -sFn(i))) //age从大到小

        return "success"
    }

    //测试请求request-promise接口
    public async testRequestV1() {
        let res = await reqGetPromise("http://localhost:8080/api/testArray", { array: "8,9,2,1,3,4", data: "123" });
        let res2= await get("http://localhost:8080/api/testArray", { params: { array: "8,9,2,1,3,4", data: "123" } });
        return res2;
    }

}