import 'dayjs/locale/zh-cn';
export declare class DateFormat {
    static dateFormat(date: number, format?: string): string;
    static dateCount(date1: Date, date2: Date, returnType?: string): number | {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
    static dateCountFormat(date1: Date, date2: Date): string;
    static today(days: number): string;
    getRangeTimeList(step: "day" | "week" | "month", num?: number, displayTimeFormat?: string, rangeTimeFormat?: string): any[];
}
//# sourceMappingURL=DateFormat.d.ts.map