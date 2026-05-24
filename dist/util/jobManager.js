"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitJob = InitJob;
exports.StartJob = StartJob;
exports.CreateJob = CreateJob;
exports.DeleteJob = DeleteJob;
exports.getJob = getJob;
exports.getJobCount = getJobCount;
const CronJob = require('cron').CronJob;
class HashTable {
    size = 0;
    entry = {};
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
    containsKey(key) {
        return (key in this.entry);
    }
    containsValue(value) {
        for (let prop in this.entry) {
            if (this.entry[prop] == value) {
                return true;
            }
        }
        return false;
    }
    getValues() {
        let values = [];
        for (let prop in this.entry) {
            values.push(this.entry[prop]);
        }
        return values;
    }
    getKeys() {
        let keys = [];
        for (let prop in this.entry) {
            keys.push(prop);
        }
        return keys;
    }
    getSize() {
        return this.size;
    }
    clear() {
        this.size = 0;
        this.entry = {};
    }
}
global.JobTable = new HashTable();
async function InitJob() {
    let jobFiles = [];
    console.info(`[jobManager]jobFiles`, jobFiles);
    if (jobFiles != null) {
        jobFiles.forEach((item) => {
            try {
                let { id, crontab, status, name } = item;
                if (item != null) {
                    let cronJob = new CronJob(crontab, async () => {
                        console.info('[jobManager]任务执行啦', id);
                        await execJob(id, name);
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
;
function CreateJob(param) {
    try {
        let { id, crontab, status, name } = param;
        if (global.JobTable.containsKey(param.id)) {
            return '任务id重复';
        }
        let cronJob = new CronJob(crontab, async () => {
            console.info('[jobManager]任务执行啦', id);
            await execJob(id, name);
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
        return 'success';
    }
    catch (e) {
        console.error('[jobManager]删除任务失败：' + e);
        return '删除任务失败';
    }
}
;
function getJob(id) {
    return global.JobTable.getValue(id);
}
function getJobCount() {
    return global.JobTable.getSize();
}
async function execJob(id, name) {
    console.info(`任务执行id :${id} name: ${name}`);
}
//# sourceMappingURL=jobManager.js.map