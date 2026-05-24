"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtExpiresIn = exports.jwtSecret = exports.iv = exports.symmetryKey = exports.clientPrivKey = exports.serverPubKey = void 0;
function getEnvVar(key, defaultValue) {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue;
}
exports.serverPubKey = process.env.RSA_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkAPE5QF2qcZboJjJYx5jb6vALdGGTEF4jucIY+dpcpXLcAgHr2RqihhRAPBwix2yw39W3+8SnY7piGV+awWbQYwLBeZ2FpiulmwPNAD9mozioxn0yUynRpkitn9uAWBqhzj28Ynkf+yq31SOGbLLtI7UTfNpku90jhob7Qxs3dCn3Qs/grJUV1xvR6SLsycwZANgP94tZDDsWJMhuN8A1C8NNKba6vV3RHFTlMOvtE/3LNLi8I5SbJV4a1+OEctP53okAUhHHXpxDzo5zFvB9LgzztdQiPsg6bRl/DJA/JvgMhaEDO5rjpR6yyFQkasLHNZ2WRuYCuf+8rOT40gMuQIDAQAB
-----END PUBLIC KEY-----
`;
exports.clientPrivKey = getEnvVar('RSA_PRIVATE_KEY');
exports.symmetryKey = getEnvVar('AES_KEY');
exports.iv = getEnvVar('AES_IV');
exports.jwtSecret = getEnvVar('JWT_SECRET');
exports.jwtExpiresIn = getEnvVar('JWT_EXPIRES_IN', '7d');
//# sourceMappingURL=keys.js.map