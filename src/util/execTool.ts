import { exec } from "child_process";
import { promisify } from "util";
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