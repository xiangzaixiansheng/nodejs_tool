"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurTimeStamp = getCurTimeStamp;
exports.getBeforeDaysTmp = getBeforeDaysTmp;
exports.formatTime = formatTime;
exports.getDate = getDate;
const dayjs_1 = __importDefault(require("dayjs"));
function getCurTimeStamp() {
    return Math.round(Date.now() / 1000);
}
function getBeforeDaysTmp(days = 2) {
    return Math.round((0, dayjs_1.default)().subtract(days, 'day').valueOf() / 1000);
}
function formatTime(time) {
    return (0, dayjs_1.default)(time).format('YYYY-MM-DD');
}
function getDate(time) {
    return (0, dayjs_1.default)(time).format('YYYY-MM-DD');
}
//# sourceMappingURL=timeTool.js.map