"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = exports.logger = void 0;
const constants_1 = require("../constant/constants");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const log4js_1 = __importDefault(require("log4js"));
const logsDir = path.parse(constants_1.LogPath).dir;
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
log4js_1.default.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m%n',
            },
        },
        dateFile: {
            type: 'dateFile',
            filename: constants_1.LogPath,
            numBackups: 7,
            pattern: '-yyyy-MM-dd',
            layout: {
                type: 'pattern',
                pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m%n',
            },
        },
    },
    categories: {
        default: {
            appenders: ['console', 'dateFile'],
            level: process.env.LOG_LEVEL || 'debug',
        },
    },
});
function getClientIp(req) {
    return (req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        'unknown');
}
function isMobile(userAgent) {
    return /Mobile/.test(userAgent) ? 'Mobile' : 'PC';
}
function formatLog(ctx, responseTime) {
    const entry = {
        timestamp: new Date().toISOString(),
        requestId: ctx.state.requestId || 'unknown',
        ip: getClientIp(ctx.req),
        method: ctx.request.method,
        path: ctx.request.path,
        referer: ctx.request.headers['referer'],
        userAgent: isMobile(ctx.request.headers['user-agent'] || ''),
        responseTime,
        statusCode: ctx.status,
    };
    return JSON.stringify(entry);
}
exports.logger = log4js_1.default.getLogger('[App]');
const loggerMiddleware = async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    exports.logger.info(formatLog(ctx, ms));
};
exports.loggerMiddleware = loggerMiddleware;
//# sourceMappingURL=logger.js.map