"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
class Filter {
    constructor(data, conditions = {}, page, page_size) {
        this.data = data;
        this.conditions = conditions;
        this.page = page;
        this.page_size = page_size;
        this.page = this.processNumber(this.page, 1);
        this.page_size = this.processNumber(this.page_size, 20);
    }
    filter() {
        let result = [];
        (this.data || []).forEach((ele, index) => {
            if (this.compareObj(ele)) {
                result.push(ele);
            }
        });
        return this.limit(result);
    }
    compareObj(itemObj) {
        for (let con_key in this.conditions) {
            let _item = typeof itemObj[con_key] == 'string' ? itemObj[con_key] : itemObj[con_key].toString();
            if (!_item.match(this.conditions[con_key])) {
                return false;
            }
        }
        return true;
    }
    limit(obj) {
        let _res = [];
        const skip = (this.page - 1) * this.page_size;
        (obj || []).forEach((item, index) => {
            if (index >= skip && index < skip + this.page_size) {
                _res.push(item);
            }
        });
        return {
            listData: _res,
            total: _res.length
        };
    }
    processNumber(value, defaultValue) {
        value = Number(value);
        if (!value || value < 1) {
            return defaultValue;
        }
        return value;
    }
}
exports.Filter = Filter;
