"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execPromise = execPromise;
exports.spawnWait = spawnWait;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execify = (0, util_1.promisify)(child_process_1.exec);
async function execPromise(data) {
    return await execify(data, {
        maxBuffer: 8000 * 1024
    });
}
async function spawnWait(command, args) {
    return new Promise((resolve) => {
        let proc = (0, child_process_1.spawn)(command, args, { stdio: "inherit" });
        proc.on("close", function (code) {
            return resolve(code || 0);
        });
    });
}
//# sourceMappingURL=execTool.js.map