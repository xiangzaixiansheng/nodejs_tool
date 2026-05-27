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
exports.addRouter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const path_1 = require("path");
require("reflect-metadata");
const multer_1 = __importDefault(require("@koa/multer"));
const constants_1 = require("../constant/constants");
const logger_1 = require("../util/logger");
const ctrPath = (0, path_1.resolve)(__dirname, "../controllers");
const uploadDir = (0, path_1.resolve)(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const uploadMiddleware = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
});
const addRouter = async (router) => {
    await recursion(ctrPath, "");
    async function recursion(folderName, prefix) {
        const files = fs.readdirSync(folderName);
        for (const name of files) {
            const filePath = path.join(folderName, name);
            const file = fs.lstatSync(filePath);
            if (file.isDirectory()) {
                const newPrefix = prefix ? `${prefix}/${name}` : `/${name}`;
                await recursion(filePath, newPrefix);
                continue;
            }
            if (/^[^.]+\.(ts|js)$/.test(name)) {
                const module = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
                const Controller = module.Controller || module.default;
                if (Controller) {
                    binding(Controller, prefix);
                }
            }
        }
    }
    function binding(m, prefix) {
        const routerMap = Reflect.getMetadata(constants_1.ROUTER_MAP, m, "method") || [];
        if (routerMap.length) {
            const ctr = new m();
            routerMap.forEach((route) => {
                const routePath = prefix + route.path;
                const obj = ctr[route.name].bind(ctr);
                if (route.name === "uploadFile" && route.method === "post") {
                    router.post(routePath, uploadMiddleware.single('file'), obj);
                }
                else {
                    router[route.method](routePath, obj);
                }
                logger_1.logger.debug("Route registered: " + routePath);
            });
        }
    }
};
exports.addRouter = addRouter;
//# sourceMappingURL=routes.js.map