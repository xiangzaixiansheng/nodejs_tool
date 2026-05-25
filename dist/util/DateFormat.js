"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormat = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const weekday_1 = __importDefault(require("dayjs/plugin/weekday"));
const localeData_1 = __importDefault(require("dayjs/plugin/localeData"));
require("dayjs/locale/zh-cn");
dayjs_1.default.extend(weekday_1.default);
dayjs_1.default.extend(localeData_1.default);
dayjs_1.default.locale('zh-cn');
class DateFormat {
    static dateFormat(date, format = "YYYY-MM-DD HH:mm:ss") {
        return (0, dayjs_1.default)(date).format(format);
    }
    static dateCount(date1, date2, returnType) {
        const diff = this.calcDiff(date1, date2);
        switch (returnType) {
            case "days":
                return diff.days;
            case "hours":
                return diff.hours + diff.days * 24;
            case "minutes":
                return diff.minutes + (diff.hours + diff.days * 24) * 60;
            case "seconds":
                return diff.seconds + (diff.minutes + (diff.hours + diff.days * 24) * 60) * 60;
            default:
                return diff;
        }
    }
    static dateCountFormat(date1, date2) {
        const { days, hours, minutes, seconds } = this.calcDiff(date1, date2);
        return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
    }
    static today(days) {
        return (0, dayjs_1.default)().subtract(days, "days").format("YYYY-MM-DD");
    }
    static getRangeTimeList(step, num = 50, displayTimeFormat = "YYYY-MM-DD", rangeTimeFormat = "YYYY-MM-DD") {
        const result = [];
        const oneDaySeconds = 24 * 3600;
        let currentUnix = (0, dayjs_1.default)().unix();
        const formatRange = (begin, end) => {
            return [begin.format(rangeTimeFormat), end.format(rangeTimeFormat)];
        };
        const formatTooltip = (begin, end) => {
            return `${begin.format(displayTimeFormat)}-${end.format(displayTimeFormat)}`;
        };
        if (step === "day") {
            for (let k = 1; k <= num; k++) {
                const day = dayjs_1.default.unix(currentUnix);
                result.push({
                    timeRange: formatRange(day, day),
                    tooltip: formatTooltip(day, day),
                });
                currentUnix -= oneDaySeconds;
            }
        }
        if (step === "week") {
            const now = (0, dayjs_1.default)();
            const firstDay = now.day(0);
            result.push({
                timeRange: formatRange(firstDay, now),
                tooltip: formatTooltip(firstDay, now),
            });
            currentUnix = firstDay.unix();
            for (let k = 2; k <= num; k++) {
                const sunday = dayjs_1.default.unix(currentUnix - oneDaySeconds);
                const monday = dayjs_1.default.unix(currentUnix - oneDaySeconds).day(0);
                result.push({
                    timeRange: formatRange(monday, sunday),
                    tooltip: formatTooltip(monday, sunday),
                });
                currentUnix -= oneDaySeconds * 7;
            }
        }
        if (step === "month") {
            const now = (0, dayjs_1.default)();
            const firstDate = now.date(1);
            result.push({
                timeRange: formatRange(firstDate, now),
                tooltip: formatTooltip(firstDate, now),
                monthKey: firstDate.format("YYYY-MM"),
            });
            currentUnix = firstDate.unix();
            for (let k = 2; k <= num; k++) {
                const dayLast = dayjs_1.default.unix(currentUnix - oneDaySeconds);
                const day1 = dayjs_1.default.unix(currentUnix - oneDaySeconds).date(1);
                result.push({
                    timeRange: formatRange(day1, dayLast),
                    tooltip: formatTooltip(day1, dayLast),
                    monthKey: dayLast.format("YYYY-MM"),
                });
                currentUnix -= oneDaySeconds * dayLast.date();
            }
        }
        return result;
    }
    static calcDiff(date1, date2) {
        const diffMs = date2.getTime() - date1.getTime();
        const days = Math.floor(diffMs / (24 * 3600 * 1000));
        const leave1 = diffMs % (24 * 3600 * 1000);
        const hours = Math.floor(leave1 / (3600 * 1000));
        const leave2 = leave1 % (3600 * 1000);
        const minutes = Math.floor(leave2 / (60 * 1000));
        const leave3 = leave2 % (60 * 1000);
        const seconds = Math.round(leave3 / 1000);
        return { days, hours, minutes, seconds };
    }
}
exports.DateFormat = DateFormat;
//# sourceMappingURL=DateFormat.js.map