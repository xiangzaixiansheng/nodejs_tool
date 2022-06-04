"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullModule = void 0;
const Queue = require("bull");
const config_1 = __importDefault(require("../config"));
const redisConfig = config_1.default().redis;
const { queue1, queue2 } = config_1.default().bullconfig;
class BullModule {
    constructor() {
        this.init();
        try {
            this.process();
        }
        catch (error) {
            console.log("任务处理出错");
        }
    }
    async init() {
        this.myQueue = new Queue(queue1, {
            redis: redisConfig, limiter: {
                max: 1000,
                duration: 5000
            }
        });
        this.myQueue = new Queue(queue2, redisConfig);
    }
    async getQueue() {
        return this.myQueue;
    }
    process() {
        this.myQueue.process(queue1, async (job, data) => {
            console.log("队列:queue1:任务开始处理");
            await this.objImpl(job);
            data();
        });
        this.myQueue.process(queue2, async (job, data) => {
            console.log("队列:queue2:任务开始处理");
            await this.activeImpl(job);
            data();
        });
    }
    async objImpl(obj) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info("消费任务", JSON.stringify(obj.data));
    }
    async activeImpl(obj) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info(JSON.stringify(obj.data));
    }
    async saveObj(obj, objName, jobId) {
        try {
            (await this.getQueue()).add(queue1, { [objName]: obj, objName: objName }, {
                removeOnComplete: true,
                jobId
            }).then(res => { console.info(`saveObj==${JSON.stringify(res)}`); }).catch(e => { console.info(`saveObj error==${JSON.stringify(e)}`); });
        }
        catch (error) {
            console.log("添加到队列中处理错误");
        }
    }
    async saveActive(userId) {
        try {
            (await this.getQueue()).add(queue2, { userId: userId }, {
                removeOnComplete: true
            });
        }
        catch (error) {
            console.log("添加到队列中处理错误");
        }
    }
}
exports.BullModule = BullModule;
exports.default = new BullModule();
