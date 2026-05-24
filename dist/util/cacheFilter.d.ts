export declare class Filter {
    data: Array<any>;
    private conditions;
    private page;
    private page_size;
    constructor(data: Array<any>, conditions: object | undefined, page: number, page_size: number);
    filter(): {
        listData: Array<object>;
        total: number;
    };
    private compareObj;
    private limit;
    private processNumber;
}
//# sourceMappingURL=cacheFilter.d.ts.map