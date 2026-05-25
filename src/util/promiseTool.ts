/**
 * @description promise、异步操作相关的工具函数。
 * @author xiangzai
 * 
 */

/**
 * 类型定义
 */
export type PromiseResolver<T> = (val: T) => void
export type PromiseReject = (reason: unknown) => void
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
    let resolved = false;
    const resolver = (val: T) => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(val);
    };

    const rejector = (reason: unknown) => {
      if (resolved) {
        return;
      }
      resolved = true;
      reject(reason);
    };

    setTimeout(() => rejector(new Error('timeout')), timeout);
    prom(resolver, rejector);
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


interface PendingTask<T = unknown> {
  resolve: (res: T) => void
  reject: (err: unknown) => void
}

const pendingTasks: Record<string, PendingTask[]> = {};

export async function executeAsyncTask<T>(
  id: string,
  task: () => Promise<T>,
): Promise<T> {
  if (id in pendingTasks) {
    return new Promise((resolve, reject) => {
      pendingTasks[id]!.push({ resolve: resolve as (res: unknown) => void, reject });
    });
  }

  let res: T | undefined;
  let error: unknown;
  try {
    pendingTasks[id] = [];
    res = await task();
  } catch (e) {
    error = e;
  }

  for (const t of pendingTasks[id]!) {
    if (error != null) {
      t.reject(error);
    } else {
      t.resolve(res);
    }
  }

  delete pendingTasks[id];

  if (error != null) {
    throw error;
  }

  return res as T;
}


export async function promiseAllLimit<T, R>(
  limit: number,
  array: T[],
  apiFn: (item: T) => Promise<R>,
): Promise<R[]> {
  const ret: Promise<R>[] = [];
  const executing: Promise<void>[] = [];
  for (const item of array) {
    const p = apiFn(item);
    ret.push(p);
    if (limit <= array.length) {
      const e: Promise<void> = p.then(() => {
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
