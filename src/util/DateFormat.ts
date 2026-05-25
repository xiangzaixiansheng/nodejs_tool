import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('zh-cn');

interface TimeDiff {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface TimeRangeItem {
    timeRange: [string, string];
    tooltip: string;
    monthKey?: string;
}

export class DateFormat {
    /**
     * 根据时间戳格式化时间
     */
    public static dateFormat(date: number, format = "YYYY-MM-DD HH:mm:ss"): string {
        return dayjs(date).format(format);
    }

    /**
     * 计算时间差
     */
    public static dateCount(
        date1: Date,
        date2: Date,
        returnType?: "days" | "hours" | "minutes" | "seconds"
    ): number | TimeDiff {
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

    /**
     * 格式化时间差为中文字符串
     */
    public static dateCountFormat(date1: Date, date2: Date): string {
        const { days, hours, minutes, seconds } = this.calcDiff(date1, date2);
        return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
    }

    /**
     * 获取当前日期前 N 天的日期
     */
    public static today(days: number): string {
        return dayjs().subtract(days, "days").format("YYYY-MM-DD");
    }

    /**
     * 根据时间刻度生成时间段列表
     */
    public static getRangeTimeList(
        step: "day" | "week" | "month",
        num = 50,
        displayTimeFormat = "YYYY-MM-DD",
        rangeTimeFormat = "YYYY-MM-DD"
    ): TimeRangeItem[] {
        const result: TimeRangeItem[] = [];
        const oneDaySeconds = 24 * 3600;
        let currentUnix = dayjs().unix();

        const formatRange = (begin: dayjs.Dayjs, end: dayjs.Dayjs): [string, string] => {
            return [begin.format(rangeTimeFormat), end.format(rangeTimeFormat)];
        };

        const formatTooltip = (begin: dayjs.Dayjs, end: dayjs.Dayjs): string => {
            return `${begin.format(displayTimeFormat)}-${end.format(displayTimeFormat)}`;
        };

        if (step === "day") {
            for (let k = 1; k <= num; k++) {
                const day = dayjs.unix(currentUnix);
                result.push({
                    timeRange: formatRange(day, day),
                    tooltip: formatTooltip(day, day),
                });
                currentUnix -= oneDaySeconds;
            }
        }

        if (step === "week") {
            const now = dayjs();
            const firstDay = now.day(0);
            result.push({
                timeRange: formatRange(firstDay, now),
                tooltip: formatTooltip(firstDay, now),
            });
            currentUnix = firstDay.unix();

            for (let k = 2; k <= num; k++) {
                const sunday = dayjs.unix(currentUnix - oneDaySeconds);
                const monday = dayjs.unix(currentUnix - oneDaySeconds).day(0);
                result.push({
                    timeRange: formatRange(monday, sunday),
                    tooltip: formatTooltip(monday, sunday),
                });
                currentUnix -= oneDaySeconds * 7;
            }
        }

        if (step === "month") {
            const now = dayjs();
            const firstDate = now.date(1);
            result.push({
                timeRange: formatRange(firstDate, now),
                tooltip: formatTooltip(firstDate, now),
                monthKey: firstDate.format("YYYY-MM"),
            });
            currentUnix = firstDate.unix();

            for (let k = 2; k <= num; k++) {
                const dayLast = dayjs.unix(currentUnix - oneDaySeconds);
                const day1 = dayjs.unix(currentUnix - oneDaySeconds).date(1);
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

    private static calcDiff(date1: Date, date2: Date): TimeDiff {
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
