
import { v4 as uuidv4 } from "uuid";
/***
 * @description 动态在内存中添加定时任务
 */

//TODO:
//1、后期优化:任务可以落文件管理
//2、增加redis锁，让一个实例执行定时任务

const JobFilePath = '../resources/jobs';
const CronJob = require('cron').CronJob;
const fs = require('fs');


class HashTable {
    private size = 0;
    private entry = new Object();

    public add(key: string, value: any) {
        if (!this.containsKey(key)) {
            this.size++;
        }
        this.entry[key] = value;
    }
    public getValue(key: string) {
        return this.containsKey(key) ? this.entry[key] : null;
    }
    public remove(key: string) {
        if (this.containsKey(key) && (delete this.entry[key])) {
            this.size--;
        }
    }
    public containsKey = function (key: string) {
        return (key in this.entry);
    }

    public containsValue = function (value: string) {
        for (let prop in this.entry) {
            if (this.entry[prop] == value) {
                return true;
            }
        }
        return false;
    }
    public getValues = function () {
        let values = new Array();
        //@ts-ignore

        for (let prop in this.entry) {
            //@ts-ignore

            values.push(this.entry[prop]);
        }
        return values;
    }
    public getKeys = function () {
        let keys = new Array();
        //@ts-ignore

        for (let prop in this.entry) {
            keys.push(prop);
        }
        return keys;
    }
    public getSize = function () {
        //@ts-ignore

        return this.size;
    }
    public clear = function () {
        this.size = 0;
        this.entry = new Object();
    }
}

global.JobTable = new HashTable();

//程序启动时执行
export async function InitJob() {
    //从数据库中获取全部的crontab信息,目前是在内存管理，后期可以通过redis和文件进行管理
    let jobFiles: any[] | null = [];
    console.info(`[jobManager]jobFiles`, jobFiles);
    if (jobFiles != null) {
        jobFiles.forEach((item, index, array) => {
            try {
                let { id, crontab, status, cicle, name } = item;
                if (item != null) {
                    let cronJob = new CronJob(crontab, async () => {
                        console.info('[jobManager]任务执行啦', id)
                        await exec(id, name);
                    }, null, true, "Asia/Shanghai");

                    let job = {
                        id,
                        crontab,
                        cronJob,
                        status,
                        name
                    };
                    global.JobTable.add(id, job);
                    StartJob(id);
                }
            } catch (e) {
                console.error('[jobManager] 加载任务失败', item.id, e);
            }
        });
    };
}

export function StartJob(id: any) {
    try {
        const job = global.JobTable.getValue(id);
        if (job != null) {
            if (!job.status) {
                return '任务已停止';
            }
            let cronJob = job.cronJob;
            if (cronJob != null) {
                console.info(`[jobManager]StartJob成功, id:${job.id}, ${job.crontab}`)
                cronJob.start();
            }
        }
        return "success";
    } catch (e) {
        console.error('[jobManager]开始任务失败：' + e);
        return '开始任务失败';
    }
};


export function CreateJob(param: any) {
    try {
        let { id, crontab, status, name } = param;
        if (global.JobTable.containsKey(param.id)) {
            return '任务id重复';
        }
        let cronJob = new CronJob(crontab, async () => {
            console.info('[jobManager]任务执行啦', id)
            await exec(id, name);
        }, null, true, "Asia/Shanghai");

        let job = {
            id: id,
            crontab: crontab,
            status: status,
            cronJob: cronJob,
            name
        };
        global.JobTable.add(id, job);
        StartJob(id);
        return 'success';
    } catch (e) {
        console.error('[jobManager]创建任务失败：' + "id:" + param.id + e);
        return '创建任务失败';
    }

};


export function DeleteJob(id: number) {
    try {
        let job = global.JobTable.getValue(id);
        if (job != null) {
            let cronJob = job.cronJob;
            if (cronJob != null) {
                cronJob.stop();
            }
        }
        global.JobTable.remove(id);
        console.info(`[jobManager]已经删除任务 id:${id}`)
    } catch (e) {
        console.error('[jobManager]删除任务失败：' + e);
        return '删除任务失败';
    }
};


function GetJob(id: number) {
    return global.JobTable.getValue(id);
};

function GetCount() {
    return global.JobTable.getSize();
};


async function exec(id: number, name: string) {
    console.info(`任务执行id :${id} name: ${name}`);
}