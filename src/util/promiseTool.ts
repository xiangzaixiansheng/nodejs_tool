/**
 * @description promise、异步操作相关的工具函数。
 * @author xiangzai
 * 
 */

/**
 * 类型定义
 */
export type PromiseResolver<T> = (val: T) => void
export type PromiseReject = (reason: any) => void
export type PromiseCallback<T> = (
    res: PromiseResolver<T>,
    rej: PromiseReject,
) => void

/**
 * 延迟指定毫秒
 */
export async function delay(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

/**
 * 增加超时机制的promise
 */
export async function promiseWithTimeout<T>(
    prom: PromiseCallback<T>,
    timeout: number,
) {
    return new Promise<T>((resolve, reject) => {
        let resolved: boolean
        const resolver = (val: T) => {
            if (resolved) {
                return
            }

            resolved = true
            resolve(val)
        }

        const rejector = (reason: any) => {
            if (resolved) {
                return
            }

            resolved = true
            reject(reason)
        }

        setTimeout(() => rejector(new Error('timeout')), timeout)
        prom(resolver, rejector)
    })
}

/**
 * 可重试的promise, 出现异常时进行重试
 * @param prom
 * @param time 重试的次数
 * @param duration 重试的间隔
 */
export async function retryablePromise<T>(
    prom: () => Promise<T>,
    time: number = 1,
    duration: number = 0,
) {
    for (let i = 0; i < time; i++) {
        try {
            const rt = await prom()
            return rt
        } catch (err) {
            if (i < time) {
                await delay(duration)
                continue
            }

            throw err
        }
    }
    return undefined
}

/**
 * 抽取出promise的Resolve和Reject函数, 可以在外部进行使用
 *
 * @example
 * ```js
 * const { promise, reject, resolve } = extraPromise()
 * ```
 */
export async function extraPromise<T>() {
    let resolve: PromiseResolver<T>
    let reject: PromiseReject
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    await delay(0)

    return {
        promise,
        reject: reject!,
        resolve: resolve!,
    }
}

/**
 * 按照 push 顺序执行并发的任务
 * 防止并发多个任务只执行一个任务后其他任务被销毁
 *
 * @typeParam R 自定义返回值类型
 *
 * @returns push 将异步操作加入任务队列，run 按顺序执行任务队列里的所有异步操作
 *
 * @example
 *
 * ```js
 *
 * const tasks = concurrentTask<MessageData[] | undefined>()
 *
 * for (let i = 0; i < messages.length; i++) {
 *    tasks.push(() => {}) // tasks.push(Promise<any>)
 * }
 * const res = await tasks.run()
 *
 * ```
 */
export function concurrentTask<R>() {
    interface Task {
        index: number
        res: R
    }
    let i = 0
    const tasks: Array<Promise<Task>> = []

    const run = async () => {
        return Promise.all(tasks).then(arr => {
            return arr.sort((a, b) => a.index - b.index).map(i => i.res)
        })
    }

    const push = (task: () => Promise<R>) => {
        const order = i++
        tasks.push(
            new Promise<Task>((resolve, reject) => {
                task()
                    .then(res => {
                        resolve({ index: order, res })
                    })
                    .catch(reject)
            }),
        )
    }

    return {
        push,
        run,
    }
}


/**
 * @description 处理重复的promise对象请求
 */
interface Task<T = any> {
    resolve: (res: T) => void
    reject: (err: any) => void
}

const pendingTask: { [id: string]: Task[] } = {}
/**
 * 执行异步任务, 它会处理重复发起的任务
 * @param id 任务唯一索引
 * @param task 异步执行方法
 *
 * @example
 *
 * ```js
 * const res = await executeAsyncTask<User>('get-user', async () => Promise<User>) // 如多次发起请求，只会请求一次
 * ```
 */
export async function executeAsyncTask<T>(
    id: string,
    task: () => Promise<T>,
): Promise<T> {
    if (id in pendingTask) {
        return new Promise((resolve, reject) => {
            pendingTask[id].push({ resolve, reject })
        })
    }

    let res: T | undefined
    let err: any
    try {
        pendingTask[id] = []
        res = await task()
    } catch (err) {
        err = err
    }

    for (let t of pendingTask[id]) {
        if (err != null) {
            t.reject(err)
        } else {
            t.resolve(res)
        }
    }

    delete pendingTask[id]

    if (err != null) {
        throw err
    }

    return res as T
}