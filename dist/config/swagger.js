"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NodeJS Tool API',
            version: '1.0.0',
            description: '企业级 Node.js API 服务',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '本地开发服务器',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', example: 'user@example.com' },
                        name: { type: 'string', example: '张三' },
                        sex: { type: 'integer', enum: [0, 1], description: '0: 女, 1: 男' },
                    },
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        error: { type: 'string' },
                        requestId: { type: 'string' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        requestId: { type: 'string' },
                    },
                },
            },
        },
        tags: [
            { name: '认证', description: '登录、注册等认证相关接口' },
            { name: '用户', description: '用户管理相关接口' },
            { name: '测试', description: 'API 测试接口' },
            { name: '系统', description: '系统健康检查等接口' },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/**/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map