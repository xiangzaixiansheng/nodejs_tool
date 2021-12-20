"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAsyncTask = exports.concurrentTask = exports.extraPromise = exports.retryablePromise = exports.promiseWithTimeout = exports.delay = void 0;
async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}
exports.delay = delay;
async function promiseWithTimeout(prom, timeout) {
    return new Promise((resolve, reject) => {
        let resolved;
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
exports.promiseWithTimeout = promiseWithTimeout;
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
exports.retryablePromise = retryablePromise;
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
exports.extraPromise = extraPromise;
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
exports.concurrentTask = concurrentTask;
const pendingTask = {};
async function executeAsyncTask(id, task) {
    if (id in pendingTask) {
        return new Promise((resolve, reject) => {
            pendingTask[id].push({ resolve, reject });
        });
    }
    let res;
    let err;
    try {
        pendingTask[id] = [];
        res = await task();
    }
    catch (err) {
        err = err;
    }
    for (let t of pendingTask[id]) {
        if (err != null) {
            t.reject(err);
        }
        else {
            t.resolve(res);
        }
    }
    delete pendingTask[id];
    if (err != null) {
        throw err;
    }
    return res;
}
exports.executeAsyncTask = executeAsyncTask;
