"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
exports.promiseWithTimeout = promiseWithTimeout;
exports.retryablePromise = retryablePromise;
exports.extraPromise = extraPromise;
exports.concurrentTask = concurrentTask;
exports.executeAsyncTask = executeAsyncTask;
exports.promiseAllLimit = promiseAllLimit;
async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}
async function promiseWithTimeout(prom, timeout) {
    return new Promise((resolve, reject) => {
        let resolved = false;
        const resolver = (val) => {
            if (resolved) {
                return;
            }
            resolved = true;
            resolve(val);
        };
        const rejector = (reason) => {
            if (resolved) {
                return;
            }
            resolved = true;
            reject(reason);
        };
        setTimeout(() => rejector(new Error('timeout')), timeout);
        prom(resolver, rejector);
    });
}
async function retryablePromise(prom, time = 1, duration = 0) {
    for (let i = 0; i < time; i++) {
        try {
            const rt = await prom();
            return rt;
        }
        catch (err) {
            if (i < time) {
                await delay(duration);
                continue;
            }
            throw err;
        }
    }
    return undefined;
}
async function extraPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    await delay(0);
    return {
        promise,
        reject: reject,
        resolve: resolve,
    };
}
function concurrentTask() {
    let i = 0;
    const tasks = [];
    const run = async () => {
        return Promise.all(tasks).then(arr => {
            return arr.sort((a, b) => a.index - b.index).map(i => i.res);
        });
    };
    const push = (task) => {
        const order = i++;
        tasks.push(new Promise((resolve, reject) => {
            task()
                .then(res => {
                resolve({ index: order, res });
            })
                .catch(reject);
        }));
    };
    return {
        push,
        run,
    };
}
const pendingTasks = {};
async function executeAsyncTask(id, task) {
    if (id in pendingTasks) {
        return new Promise((resolve, reject) => {
            pendingTasks[id].push({ resolve: resolve, reject });
        });
    }
    let res;
    let error;
    try {
        pendingTasks[id] = [];
        res = await task();
    }
    catch (e) {
        error = e;
    }
    for (const t of pendingTasks[id]) {
        if (error != null) {
            t.reject(error);
        }
        else {
            t.resolve(res);
        }
    }
    delete pendingTasks[id];
    if (error != null) {
        throw error;
    }
    return res;
}
async function promiseAllLimit(limit, array, apiFn) {
    const ret = [];
    const executing = [];
    for (const item of array) {
        const p = apiFn(item);
        ret.push(p);
        if (limit <= array.length) {
            const e = p.then(() => {
                executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}
//# sourceMappingURL=promiseTool.js.map