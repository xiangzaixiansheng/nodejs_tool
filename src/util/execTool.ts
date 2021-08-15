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