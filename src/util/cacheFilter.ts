
export class Filter {
    //conditions里面的val支持正则匹配
    constructor(public data: Array<any>, private conditions: object = {}, private page: number, private page_size: number) {
        this.page = this.processNumber(this.page, 1);
        this.page_size = this.processNumber(this.page_size, 20);
    }

    public filter(): { listData: Array<object>, total: number } {
        let result: Array<object> = [];
        (this.data || []).forEach((ele, index) => {
            if (this.compareObj(ele)) {
                result.push(ele);
            }
        });
        return this.limit(result);
    }

    private compareObj(itemObj: any): Boolean {
        for (let con_key in this.conditions) {
            let _item = typeof itemObj[con_key] == 'string' ? itemObj[con_key] : itemObj[con_key].toString();
            //@ts-ignore
            if (!_item.match(this.conditions[con_key])) {
                return false;
            }
        }
        return true;
    }

    private limit(obj: Array<object>): { listData: Array<object>, total: number } {
        let _res: Array<object> = []
        const skip = (this.page - 1) * this.page_size;
        (obj || []).forEach((item, index) => {
            if (index >= skip && index < skip + this.page_size) {
                _res.push(item);
            }
        })
        return {
            listData: _res,
            total: _res.length
        }
    }

    private processNumber(value: any, defaultValue: number) {
        value = Number(value);
        if (!value || value < 1) {
            // 不允许非数字或者小于1的数字
            return defaultValue;
        }
        return value;
    }

}

// console.info(new Filter(data, { id: 8 }, 2, 1).filter());