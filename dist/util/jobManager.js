"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteJob = exports.CreateJob = exports.StartJob = exports.InitJob = void 0;
const JobFilePath = '../resources/jobs';
const CronJob = require('cron').CronJob;
const fs = require('fs');
class HashTable {
    constructor() {
        this.size = 0;
        this.entry = new Object();
        this.containsKey = function (key) {
            return (key in this.entry);
        };
        this.containsValue = function (value) {
            for (let prop in this.entry) {
                if (this.entry[prop] == value) {
                    return true;
                }
            }
            return false;
        };
        this.getValues = function () {
            let values = new Array();
            for (let prop in this.entry) {
                values.push(this.entry[prop]);
            }
            return values;
        };
        this.getKeys = function () {
            let keys = new Array();
            for (let prop in this.entry) {
                keys.push(prop);
            }
            return keys;
        };
        this.getSize = function () {
            return this.size;
        };
        this.clear = function () {
            this.size = 0;
            this.entry = new Object();
        };
    }
    add(key, value) {
        if (!this.containsKey(key)) {
            this.size++;
        }
        this.entry[key] = value;
    }
    getValue(key) {
        return this.containsKey(key) ? this.entry[key] : null;
    }
    remove(key) {
        if (this.containsKey(key) && (delete this.entry[key])) {
            this.size--;
        }
    }
}
global.JobTable = new HashTable();
async function InitJob() {
    let jobFiles = [];
    console.info(`[jobManager]jobFiles`, jobFiles);
    if (jobFiles != null) {
        jobFiles.forEach((item, index, array) => {
            try {
                let { id, crontab, status, cicle, name } = item;
                if (item != null) {
                    let cronJob = new CronJob(crontab, async () => {
                        console.info('[jobManager]任务执行啦', id);
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
            }
            catch (e) {
                console.error('[jobManager] 加载任务失败', item.id, e);
            }
        });
    }
    ;
}
exports.InitJob = InitJob;
function StartJob(id) {
    try {
        const job = global.JobTable.getValue(id);
        if (job != null) {
            if (!job.status) {
                return '任务已停止';
            }
            let cronJob = job.cronJob;
            if (cronJob != null) {
                console.info(`[jobManager]StartJob成功, id:${job.id}, ${job.crontab}`);
                cronJob.start();
            }
        }
        return "success";
    }
    catch (e) {
        console.error('[jobManager]开始任务失败：' + e);
        return '开始任务失败';
    }
}
exports.StartJob = StartJob;
;
function CreateJob(param) {
    try {
        let { id, crontab, status, name } = param;
        if (global.JobTable.containsKey(param.id)) {
            return '任务id重复';
        }
        let cronJob = new CronJob(crontab, async () => {
            console.info('[jobManager]任务执行啦', id);
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
    }
    catch (e) {
        console.error('[jobManager]创建任务失败：' + "id:" + param.id + e);
        return '创建任务失败';
    }
}
exports.CreateJob = CreateJob;
;
function DeleteJob(id) {
    try {
        let job = global.JobTable.getValue(id);
        if (job != null) {
            let cronJob = job.cronJob;
            if (cronJob != null) {
                cronJob.stop();
            }
        }
        global.JobTable.remove(id);
        console.info(`[jobManager]已经删除任务 id:${id}`);
    }
    catch (e) {
        console.error('[jobManager]删除任务失败：' + e);
        return '删除任务失败';
    }
}
exports.DeleteJob = DeleteJob;
;
function GetJob(id) {
    return global.JobTable.getValue(id);
}
;
function GetCount() {
    return global.JobTable.getSize();
}
;
async function exec(id, name) {
    console.info(`任务执行id :${id} name: ${name}`);
}
