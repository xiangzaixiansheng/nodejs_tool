"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
class Filter {
    data;
    conditions;
    page;
    pageSize;
    constructor(data, conditions = {}, page, pageSize) {
        this.data = data;
        this.conditions = conditions;
        this.page = this.processNumber(page, 1);
        this.pageSize = this.processNumber(pageSize, 20);
    }
    filter() {
        const result = (this.data || []).filter((item) => this.matchConditions(item));
        return this.paginate(result);
    }
    matchConditions(item) {
        for (const key of Object.keys(this.conditions)) {
            const pattern = this.conditions[key];
            if (!pattern)
                continue;
            const value = String(item[key] ?? '');
            if (!value.match(pattern)) {
                return false;
            }
        }
        return true;
    }
    paginate(items) {
        const skip = (this.page - 1) * this.pageSize;
        const listData = items.slice(skip, skip + this.pageSize);
        return {
            listData,
            total: items.length,
        };
    }
    processNumber(value, defaultValue) {
        const num = Number(value);
        if (!num || num < 1) {
            return defaultValue;
        }
        return num;
    }
}
exports.Filter = Filter;
//# sourceMappingURL=cacheFilter.js.map