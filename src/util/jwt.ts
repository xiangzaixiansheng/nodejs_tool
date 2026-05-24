import jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpiresIn } from '../config/keys';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as jwt.SignOptions);
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtSecret) as JwtPayload;
}

/**
 * 解码 JWT Token（不验证）
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}
