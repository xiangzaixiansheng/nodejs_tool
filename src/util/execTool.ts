/**
 * @description 执行命令的方法
 * @author xiangzai
 */

import { exec } from "child_process";
import { promisify } from "util";
import { spawn, spawnSync } from "child_process";

const execify = promisify(exec);

/**
 * 执行linux命令
 * @param data 
 * @returns 
 */
async function execPromise(data: string) {
    return await execify(data, {
        maxBuffer: 8000 * 1024
    });
}

/**
 * @description 指定命令，结束后带有返回值的那种 例如安卓手机录屏等
 * @param command 
 * @param args 
 * @returns 
 */
export async function spawnWait(
    command: string,
    args: readonly string[]
): Promise<number> {
    return new Promise((resolve) => {
        let proc = spawn(command, args, { stdio: "inherit" });
        proc.on("close", function (code) {
            return resolve(code || 0);
        });
    });
}

/**
 * exec将子进程输出结果暂放在buffer中，在结果完全返回后，再将输出一次性的以回调函数返回。
 * 如果exec的buffer体积设置的不够大，它将会以一个“maxBuffer exceeded”错误失败告终。
 * 而spawn在子进程开始执行后，就不断的将数据从子进程返回给主进程，它没有回调函数，它通过流的方式发数据传给主进程，
 * 从而实现了多进程之间的数据交换。这个功能的直接用应用场景就是“系统监控”。 
 * 2、书写上，exec更方便一些,将整个命令放在第一个参数中，而spqwn需要拆分。 
 * child_process.spawn('python', ['support.py', i]) 
 * child_process.exec('python support.py '+i, callback)
 */