"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPath = exports.ROUTER_MAP = void 0;
const path_1 = __importDefault(require("path"));
exports.ROUTER_MAP = Symbol('route_map');
exports.LogPath = path_1.default.resolve(__dirname, '../../logs/koa.log');
