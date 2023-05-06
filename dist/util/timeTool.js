"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDate = exports.formatTime = exports.getBeforeDaysTmp = exports.getCurTimeStamp = void 0;
const getCurTimeStamp = () => {
    return Math.round(new Date().getTime() / 1000);
};
exports.getCurTimeStamp = getCurTimeStamp;
const getBeforeDaysTmp = (days = 2) => {
    return Math.round((new Date().getTime() - 24 * 60 * 60 * 1000 * days) / 1000);
};
exports.getBeforeDaysTmp = getBeforeDaysTmp;
function formatTime(time) {
    const year = time.getFullYear();
    const [month, day] = [time.getMonth() + 1, time.getDate()].map(formatNumber);
    return `${year}-${month}-${day}`;
}
exports.formatTime = formatTime;
function formatNumber(n) {
    return n < 10 ? `0${n}` : n;
}
const getDate = (time) => {
    time = new Date(time);
    const [year, month, date] = [
        time.getFullYear(),
        time.getMonth() + 1,
        time.getDate(),
    ].map((n) => (n < 10 ? `0${n}` : n));
    return `${year}-${month}-${date}`;
};
exports.getDate = getDate;
