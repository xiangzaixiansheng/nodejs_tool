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
}
exports.DateFormat = DateFormat;
