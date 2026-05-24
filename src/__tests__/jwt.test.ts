import { describe, it, expect, beforeAll } from 'vitest';
import { generateToken, verifyToken, decodeToken, JwtPayload } from '../util/jwt';

describe('JWT', () => {
  const mockPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: '123',
    email: 'test@example.com',
  };

  let token: string;

  beforeAll(() => {
    token = generateToken(mockPayload);
  });

  it('should generate a token', () => {
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT 有三个部分
  });

  it('should verify and decode token', () => {
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.email).toBe(mockPayload.email);
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it('should decode token without verification', () => {
    const decoded = decodeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockPayload.userId);
  });
});
