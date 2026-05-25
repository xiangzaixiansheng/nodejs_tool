interface FilterResult<T> {
    listData: T[];
    total: number;
}

export class Filter<T extends Record<string, unknown>> {
    private readonly page: number;
    private readonly pageSize: number;

    constructor(
        public data: T[],
        private readonly conditions: Partial<Record<keyof T, string | RegExp>> = {},
        page: number,
        pageSize: number,
    ) {
        this.page = this.processNumber(page, 1);
        this.pageSize = this.processNumber(pageSize, 20);
    }

    public filter(): FilterResult<T> {
        const result = (this.data || []).filter((item) => this.matchConditions(item));
        return this.paginate(result);
    }

    private matchConditions(item: T): boolean {
        for (const key of Object.keys(this.conditions) as Array<keyof T>) {
            const pattern = this.conditions[key];
            if (!pattern) continue;

            const value = String(item[key] ?? '');
            if (!value.match(pattern)) {
                return false;
            }
        }
        return true;
    }

    private paginate(items: T[]): FilterResult<T> {
        const skip = (this.page - 1) * this.pageSize;
        const listData = items.slice(skip, skip + this.pageSize);
        return {
            listData,
            total: items.length,
        };
    }

    private processNumber(value: unknown, defaultValue: number): number {
        const num = Number(value);
        if (!num || num < 1) {
            return defaultValue;
        }
        return num;
    }
}
