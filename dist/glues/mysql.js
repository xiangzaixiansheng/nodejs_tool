"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.createMysqlConnection = createMysqlConnection;
exports.getDataSource = getDataSource;
const typeorm_1 = require("typeorm");
const config_1 = __importDefault(require("../config"));
let AppDataSource;
function createMysqlConnection() {
    const config = (0, config_1.default)();
    exports.AppDataSource = AppDataSource = new typeorm_1.DataSource({
        ...config.mysql,
        type: "mysql"
    });
    return AppDataSource.initialize();
}
function getDataSource() {
    if (!AppDataSource || !AppDataSource.isInitialized) {
        throw new Error("Database not initialized. Call createMysqlConnection first.");
    }
    return AppDataSource;
}
//# sourceMappingURL=mysql.js.map