"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = void 0;
const router_1 = __importDefault(require("@koa/router"));
const koa2_swagger_ui_1 = require("koa2-swagger-ui");
const swagger_1 = require("../config/swagger");
const router = new router_1.default();
router.get('/swagger.json', (ctx) => {
    ctx.body = swagger_1.swaggerSpec;
});
exports.swaggerUi = (0, koa2_swagger_ui_1.koaSwagger)({
    routePrefix: '/api-docs',
    swaggerOptions: {
        url: '/swagger.json',
    },
});
exports.default = router;
//# sourceMappingURL=swagger.js.map