"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const logger_1 = require("../util/logger");
class ApiService {
    async testRequestV1() {
        logger_1.logger.info('Test request executed');
        return 'Test successful';
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=ApiService.js.map