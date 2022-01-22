/**
 * @description 时间格式化/获取时间差
 * @author xiangzai
 */
import moment = require("moment");
export class DateFormat {
    /**
     * 根据时间戳格式化时间
     * @param date 传入时间戳
     * @param format 格式化时间格式,默认'YYYY-MM-DD HH:mm:ss'
     */
    public static dateFormat(date: number, format?: string) {
        return moment(date).format(format || "YYYY-MM-DD HH:mm:ss");
    }
    /**
     * 计算时间差,包括计算，天，时，分，秒
     * @param date1 开始时间
     * @param date2  结束时间
     * @param returnType  返回结果类型-{days,hours,minutes,seconds,all}
     * @param format  是否格式化返回 true:days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒";
     * false: {'days':days,'hours':hours,'minutes':minutes,'seconds':seconds}
     */
    public static dateCount(date1: Date, date2: Date, returnType?: string) {
        const date3 = date2.getTime() - date1.getTime(); // 时间差的毫秒数
        // 计算出相差天数
        const days = Math.floor(date3 / (24 * 3600 * 1000));
        // 计算出小时数
        const leave1 = date3 % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
        const hours = Math.floor(leave1 / (3600 * 1000));
        // 计算相差分钟数
        const leave2 = leave1 % (3600 * 1000); // 计算小时数后剩余的毫秒数
        const minutes = Math.floor(leave2 / (60 * 1000));
        // 计算相差秒数
        const leave3 = leave2 % (60 * 1000); // 计算分钟数后剩余的毫秒数
        const seconds = Math.round(leave3 / 1000);
        // 判断需要的返回类型
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

    /**
     * 格式化时间差
     * @param date1 开始时间
     * @param date2  结束时间
     * @param format  是否格式化返回 true:days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒";
     * false: {'days':days,'hours':hours,'minutes':minutes,'seconds':seconds}
     */
    public static dateCountFormat(date1: Date, date2: Date) {
        const date3 = date2.getTime() - date1.getTime(); // 时间差的毫秒数
        // 计算出相差天数
        const days = Math.floor(date3 / (24 * 3600 * 1000));
        // 计算出小时数
        const leave1 = date3 % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
        const hours = Math.floor(leave1 / (3600 * 1000));
        // 计算相差分钟数
        const leave2 = leave1 % (3600 * 1000); // 计算小时数后剩余的毫秒数
        const minutes = Math.floor(leave2 / (60 * 1000));
        // 计算相差秒数
        const leave3 = leave2 % (60 * 1000); // 计算分钟数后剩余的毫秒数
        const seconds = Math.round(leave3 / 1000);

        return days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒";
    }
    /**
     *   拿取当前日期前某一天日期
     * @param days 天数
     */
    public static today(days: number) {

        const today = moment();

        return today.subtract(days, "days").format("YYYY-MM-DD"); /*前一天的时间*/
    }

    /**
     * 根据时间刻度 day week month 生成对应的时间段列表
     * step: 时间段刻度 day | week | month
     * num: 输出多少组数据
     * displayTimeFormat: 显示时间的格式(可自定义)
     * rangeTimeFormat: 时间范围的格式(可自定义)
    */
    //getRangeTimeList("month", 12)
    public getRangeTimeList(
        step: "day" | "week" | "month",
        num = 50,
        displayTimeFormat = 'YYYY-MM-DD',
        rangeTimeFormat = 'YYYY-MM-DD'
    ) {
        moment.locale('zh-cn')
        let now = moment() // 当前日期
        let result: any[] = []
        const oneDayTime = 24 * 3600 // 一天的秒数 注意不是毫秒数
        let currentUnix = now.unix() // 当前unix时间戳

        const getTimeRange = (begin: any, end: any) => {
            return [begin.format(rangeTimeFormat), end.format(rangeTimeFormat)]
        }
        const getDisplayTime = (begin: any, end: any) => {
            return begin.format(displayTimeFormat) + '-' + end.format(displayTimeFormat)
        }

        const getYearMonth = (begin: any) => {
            return begin.format('YYYY-MM');
        }

        if (step === 'day') {
            for (let k = 1; k <= num; k++) {
                const obj: any = {}
                const day = moment.unix(currentUnix)
                obj.timeRange = getTimeRange(day, day)
                obj.tooltip = getDisplayTime(day, day)
                result.push(obj)
                currentUnix -= oneDayTime
            }
        }
        if (step === 'week') {
            // 处理当前这周
            const lastWeek: any = {}
            const firstDay = moment(now).weekday(0)
            lastWeek.timeRange = getTimeRange(firstDay, now)
            lastWeek.tooltip = getDisplayTime(firstDay, now)
            currentUnix = firstDay.unix()
            result.push(lastWeek)
            // 处理剩余n-1周
            for (let k = 2; k <= num; k++) {
                const obj: any = {}
                const sunday = moment.unix(currentUnix - oneDayTime) // 当前周-时间戳减去一天 等于上周日时间戳
                const monday = moment(moment.unix(currentUnix - oneDayTime).weekday(0))
                obj.timeRange = getTimeRange(monday, sunday)
                obj.tooltip = getDisplayTime(monday, sunday)
                result.push(obj)
                currentUnix -= oneDayTime * 7
            }
        }
        if (step === 'month') {
            // 处理当前月
            const lastMonth: any = {}
            const firstDate = moment(now).date(1)
            lastMonth.timeRange = getTimeRange(firstDate, now)
            lastMonth.tooltip = getDisplayTime(firstDate, now)
            lastMonth.monthKey = getYearMonth(firstDate);
            currentUnix = firstDate.unix()
            result.push(lastMonth)
            // 处理剩余n-1个月
            for (let k = 2; k <= num; k++) {
                const obj: any = {}
                const dayLast = moment.unix(currentUnix - oneDayTime) // 当前月第一天时间戳减去一天 等于上个月最后一天时间戳
                const n = dayLast.date()
                const day1 = moment(moment.unix(currentUnix - oneDayTime).date(1))
                obj.timeRange = getTimeRange(day1, dayLast)
                obj.tooltip = getDisplayTime(day1, dayLast)
                obj.monthKey = getYearMonth(dayLast);
                result.push(obj)
                currentUnix -= oneDayTime * n
            }
        }
        return result;
    }

}
