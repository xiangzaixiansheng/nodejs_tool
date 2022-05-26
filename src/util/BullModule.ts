
import Queue = require('bull');

import Bull = require('bull');

import { v4 as uuidv4 } from "uuid";

import getConfig from "../config";
const redisConfig = getConfig().redis;

const { queue1, queue2 } = getConfig().bullconfig;

/**
 * 文档相关
 * 存储任务的参数
 * https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#jobfinished
 * 
 * 所有api的文档
 * https://github.com/OptimalBits/bull/blob/master/REFERENCE.md
 * 
 * bull地址
 * https://github.com/OptimalBits/bull
 */

export class BullModule {
    /**
     * Queue对象
     */
    public myQueue!: Bull.Queue<any>;

    constructor() {
        this.init();
        try {
            this.process();
        } catch (error) {
            console.log("任务处理出错");
        }
    }

    /**
     * 初始化
     */
    public async init() {
        // Limit queue to max 1.000 jobs per 5 seconds.
        this.myQueue = new Queue(queue1, {
            redis: redisConfig, limiter: {
                max: 1000,
                duration: 5000
            }
        });
        this.myQueue = new Queue(queue2, redisConfig);
    }

    /**
     * 拿到队列队形
     */
    public async getQueue() {
        return this.myQueue;
    }

    /**
     * 绑定任务处理函数
     */
    public process() {
        // 2. 绑定任务处理函数
        this.myQueue.process(queue1, async (job: any, data: () => void) => {
            console.log("队列:queue1:任务开始处理");
            // 执行保存对象操作
            await this.objImpl(job);
            data();
        });
        this.myQueue.process(queue2, async (job: any, data: () => void) => {
            console.log("队列:queue2:任务开始处理");
            // 执行保存对象操作
            await this.activeImpl(job);
            data();
        });
    }
    /**
     * 执行任务一
     * @param obj 对象json
     */
    public async objImpl(obj: any) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info("消费任务", JSON.stringify(obj.data))
    }

    /**
     * 执行任务二
     * @param obj 对象
     */
    public async activeImpl(obj: any) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info(JSON.stringify(obj.data));
    }

    /**
     * 像用户队列一存储数据
     * 接口访问量较高时调用中间件保存对象,
     * 经过测试直接调用数据库保存平均4ms左右,
     * 使用中间件保存平均2.2ms左右
     * 存储任务的参数文档
     * https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#jobfinished
     * @param obj 需要保存的对象
     * @param objName json对象名称,在执行消息队列方法中判断对象使用
     */
    public async saveObj(obj: any, objName: string, jobId: number) {
        try {
            // 添加到对象保存队列中处理
            // tslint:disable-next-line:object-literal-key-quotes
            (await this.getQueue()).add(queue1, { [objName]: obj, objName: objName }, {
                removeOnComplete: true,
                jobId ////jobId is unique. If you attempt to add a job with an id that already exists, it will not be added.
            }).then(res => { console.info(`saveObj==${JSON.stringify(res)}`) }).catch(e => { console.info(`saveObj error==${JSON.stringify(e)}`) });
        } catch (error) {
            console.log("添加到队列中处理错误");
        }
    }

    /**
     * 向用户队列2天添加数据
     * @param obj 需要保存的对象
     * @param objName json对象名称,在执行消息队列方法中判断对象使用
     */
    public async saveActive(userId: string) {
        try {
            // 添加到对象保存队列中处理
            // tslint:disable-next-line:object-literal-key-quotes
            (await this.getQueue()).add(queue2, { userId: userId }, {
                removeOnComplete: true
            });
        } catch (error) {
            console.log("添加到队列中处理错误");
        }
    }
}
export default new BullModule();

// const bull_test = new BullModule();

// (async function test() {
//     for (let index = 0; index < 10; index++) {
//         bull_test.saveObj({ test: index }, "testqueue", 1)
//         //await new Promise(resolve => setTimeout(resolve, 3000));
//     }
// })()