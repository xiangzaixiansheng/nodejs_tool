interface FilterResult<T> {
    listData: T[];
    total: number;
}
export declare class Filter<T extends Record<string, unknown>> {
    data: T[];
    private readonly conditions;
    private readonly page;
    private readonly pageSize;
    constructor(data: T[], conditions: Partial<Record<keyof T, string | RegExp>> | undefined, page: number, pageSize: number);
    filter(): FilterResult<T>;
    private matchConditions;
    private paginate;
    private processNumber;
}
export {};
//# sourceMappingURL=cacheFilter.d.ts.map