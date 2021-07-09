import { redisDb0 } from '../util/redisTool';
import { sortBy, arrayChunk } from '../util/arrayTool';
import { reqGetPromise } from '../util/reqPromiseTool';
import { get } from '../util/requestTool';

export class ApiService {

    //测试读写redis
    public async testRedis() {
        //测试set
        let res = await redisDb0.setString("test", { hello: "hello" });
        //测试hset和加锁
        let res2 = await redisDb0.hset("testJson", "userName", "haha");
        //测试scan方法
        let res3 = await redisDb0.scan("*", 100);
        return res3;
    }

    //测试数组相关的
    public async testArray(query?: any) {
        if (query && query.array) {
            return sortBy(query.array.split(","));
        }

        let testArray = [8, 9, 2, 1, 0, 6];
        let result1 = sortBy(testArray);
        let result2 = sortBy(testArray, (item) => -item); //倒序
        let chunk = arrayChunk(testArray, 3); //[ [ 8, 9, 2 ], [ 1, 0, 6 ] ]

        console.error(result1);
        console.error(result2);
        console.error(chunk);

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