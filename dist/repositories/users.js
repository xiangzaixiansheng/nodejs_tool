"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getAllUserInfo = void 0;
const entities_1 = require("../entities");
const getAllUserInfo = async (page, size) => {
    const list = await entities_1.UsersEntity.getRepository()
        .createQueryBuilder('ui')
        .select([
        "ui.id",
        "ui.name",
        "ui.email",
    ])
        .skip((page - 1) * size)
        .take(size)
        .orderBy('ui.id', 'DESC')
        .getMany();
    const count = await entities_1.UsersEntity.getRepository().count();
    return [list, count];
};
exports.getAllUserInfo = getAllUserInfo;
const createUser = async (data) => {
    return await entities_1.UsersEntity.getRepository().save(data);
};
exports.createUser = createUser;
