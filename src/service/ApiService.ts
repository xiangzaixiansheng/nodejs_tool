import { redisDb0 } from '../util/redisTool';

export class ApiService {

    public async testRedis() {
        //测试set
        let res = await redisDb0.setString("test", { hello: "hello" });
        //测试hset和加锁
        let res2 = await redisDb0.hset("testJson", "userName", "haha");
        //测试scan方法
        let res3 = await redisDb0.scan("*", 100);
        return res3;
    }

}