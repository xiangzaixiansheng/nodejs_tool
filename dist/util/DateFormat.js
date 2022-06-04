"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormat = void 0;
const moment = require("moment");
class DateFormat {
    static dateFormat(date, format) {
        return moment(date).format(format || "YYYY-MM-DD HH:mm:ss");
    }
    static dateCount(date1, date2, returnType) {
        const date3 = date2.getTime() - date1.getTime();
        const days = Math.floor(date3 / (24 * 3600 * 1000));
        const leave1 = date3 % (24 * 3600 * 1000);
        const hours = Math.floor(leave1 / (3600 * 1000));
        const leave2 = leave1 % (3600 * 1000);
        const minutes = Math.floor(leave2 / (60 * 1000));
        const leave3 = leave2 % (60 * 1000);
        const seconds = Math.round(leave3 / 1000);
        switch (returnType) {
            case "days":
                return days;
            case "hours":
                return hours + days * 24;
            case "days":
                return minutes + (hours + days * 24) * 60;
            case "days":
                return seconds + (minutes + (hours + days * 24) * 60);
            default:
                break;
        }
    }
    static dateCountFormat(date1, date2) {
        const date3 = date2.getTime() - date1.getTime();
        const days = Math.floor(date3 / (24 * 3600 * 1000));
        const leave1 = date3 % (24 * 3600 * 1000);
        const hours = Math.floor(leave1 / (3600 * 1000));
        const leave2 = leave1 % (3600 * 1000);
        const minutes = Math.floor(leave2 / (60 * 1000));
        const leave3 = leave2 % (60 * 1000);
        const seconds = Math.round(leave3 / 1000);
        return days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒";
    }
    static today(days) {
        const today = moment();
        return today.subtract(days, "days").format("YYYY-MM-DD");
    }
    getRangeTimeList(step, num = 50, displayTimeFormat = 'YYYY-MM-DD', rangeTimeFormat = 'YYYY-MM-DD') {
        moment.locale('zh-cn');
        let now = moment();
        let result = [];
        const oneDayTime = 24 * 3600;
        let currentUnix = now.unix();
        const getTimeRange = (begin, end) => {
            return [begin.format(rangeTimeFormat), end.format(rangeTimeFormat)];
        };
        const getDisplayTime = (begin, end) => {
            return begin.format(displayTimeFormat) + '-' + end.format(displayTimeFormat);
        };
        const getYearMonth = (begin) => {
            return begin.format('YYYY-MM');
        };
        if (step === 'day') {
            for (let k = 1; k <= num; k++) {
                const obj = {};
                const day = moment.unix(currentUnix);
                obj.timeRange = getTimeRange(day, day);
                obj.tooltip = getDisplayTime(day, day);
                result.push(obj);
                currentUnix -= oneDayTime;
            }
        }
        if (step === 'week') {
            const lastWeek = {};
            const firstDay = moment(now).weekday(0);
            lastWeek.timeRange = getTimeRange(firstDay, now);
            lastWeek.tooltip = getDisplayTime(firstDay, now);
            currentUnix = firstDay.unix();
            result.push(lastWeek);
            for (let k = 2; k <= num; k++) {
                const obj = {};
                const sunday = moment.unix(currentUnix - oneDayTime);
                const monday = moment(moment.unix(currentUnix - oneDayTime).weekday(0));
                obj.timeRange = getTimeRange(monday, sunday);
                obj.tooltip = getDisplayTime(monday, sunday);
                result.push(obj);
                currentUnix -= oneDayTime * 7;
            }
        }
        if (step === 'month') {
            const lastMonth = {};
            const firstDate = moment(now).date(1);
            lastMonth.timeRange = getTimeRange(firstDate, now);
            lastMonth.tooltip = getDisplayTime(firstDate, now);
            lastMonth.monthKey = getYearMonth(firstDate);
            currentUnix = firstDate.unix();
            result.push(lastMonth);
            for (let k = 2; k <= num; k++) {
                const obj = {};
                const dayLast = moment.unix(currentUnix - oneDayTime);
                const n = dayLast.date();
                const day1 = moment(moment.unix(currentUnix - oneDayTime).date(1));
                obj.timeRange = getTimeRange(day1, dayLast);
                obj.tooltip = getDisplayTime(day1, dayLast);
                obj.monthKey = getYearMonth(dayLast);
                result.push(obj);
                currentUnix -= oneDayTime * n;
            }
        }
        return result;
    }
}
exports.DateFormat = DateFormat;
