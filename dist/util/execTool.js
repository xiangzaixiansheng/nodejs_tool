"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const execify = util_1.promisify(child_process_1.exec);
async function execPromise(data) {
    return await execify(data, {
        maxBuffer: 8000 * 1024
    });
}
