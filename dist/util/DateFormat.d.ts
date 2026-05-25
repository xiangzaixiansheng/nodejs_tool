import 'dayjs/locale/zh-cn';
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
export declare class DateFormat {
    static dateFormat(date: number, format?: string): string;
    static dateCount(date1: Date, date2: Date, returnType?: "days" | "hours" | "minutes" | "seconds"): number | TimeDiff;
    static dateCountFormat(date1: Date, date2: Date): string;
    static today(days: number): string;
    static getRangeTimeList(step: "day" | "week" | "month", num?: number, displayTimeFormat?: string, rangeTimeFormat?: string): TimeRangeItem[];
    private static calcDiff;
}
export {};
//# sourceMappingURL=DateFormat.d.ts.map