/**
 * 密钥配置 - 从环境变量读取
 * 生产环境请使用密钥管理服务（KMS/Vault）
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

/**
 * 服务器公钥（可以公开）
 * 生产环境可以从环境变量读取，或作为配置注入
 */
export const serverPubKey = process.env.RSA_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkAPE5QF2qcZboJjJYx5jb6vALdGGTEF4jucIY+dpcpXLcAgHr2RqihhRAPBwix2yw39W3+8SnY7piGV+awWbQYwLBeZ2FpiulmwPNAD9mozioxn0yUynRpkitn9uAWBqhzj28Ynkf+yq31SOGbLLtI7UTfNpku90jhob7Qxs3dCn3Qs/grJUV1xvR6SLsycwZANgP94tZDDsWJMhuN8A1C8NNKba6vV3RHFTlMOvtE/3LNLi8I5SbJV4a1+OEctP53okAUhHHXpxDzo5zFvB9LgzztdQiPsg6bRl/DJA/JvgMhaEDO5rjpR6yyFQkasLHNZ2WRuYCuf+8rOT40gMuQIDAQAB
-----END PUBLIC KEY-----
`;

/**
 * 客户端私钥 - 从环境变量读取
 * 生产环境必须使用密钥管理服务
 */
export const clientPrivKey = getEnvVar('RSA_PRIVATE_KEY');

/**
 * 对称加密密钥
 */
export const symmetryKey = getEnvVar('AES_KEY');

/**
 * AES IV
 */
export const iv = getEnvVar('AES_IV');

/**
 * JWT 密钥
 */
export const jwtSecret = getEnvVar('JWT_SECRET');

/**
 * JWT 过期时间
 */
export const jwtExpiresIn = getEnvVar('JWT_EXPIRES_IN', '7d');
