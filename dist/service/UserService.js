"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repositories_1 = require("../repositories");
class UserService {
    async getAll(data) {
        let { page, size } = data;
        page = this.processTakePageNum(page, 1);
        size = this.processTakePageNum(size, 100);
        const [listData, total] = await repositories_1.getAllUserInfo(page, size);
        return {
            listData,
            total
        };
    }
    async create(data) {
        return await repositories_1.createUser(data);
    }
    processTakePageNum(value, defaultValue) {
        value = Number(value);
        if (!value || value < 1) {
            return defaultValue;
        }
        return value;
    }
}
exports.UserService = UserService;
