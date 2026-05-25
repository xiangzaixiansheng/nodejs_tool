"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = wrap;
async function wrap(task) {
    try {
        const data = await task;
        return { statusCode: 200, data };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { statusCode: -100, msg };
    }
}
//# sourceMappingURL=requestRes.js.map