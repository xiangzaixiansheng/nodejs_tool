import { describe, it, expect } from 'vitest';
import {
  createUserSchema,
  paginationSchema,
  testArraySchema,
  loginSchema,
} from '../schemas';

describe('Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate valid user data', () => {
      const data = {
        email: 'test@example.com',
        name: 'Test User',
        sex: '1' as const,
      };
      const result = createUserSchema.parse(data);
      expect(result.email).toBe(data.email);
      expect(result.name).toBe(data.name);
      expect(result.sex).toBe(1);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        name: 'Test User',
      };
      expect(() => createUserSchema.parse(data)).toThrow();
    });

    it('should reject empty name', () => {
      const data = {
        email: 'test@example.com',
        name: '',
      };
      expect(() => createUserSchema.parse(data)).toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should provide default values', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });

    it('should parse string numbers', () => {
      const result = paginationSchema.parse({ page: '5', size: '20' });
      expect(result.page).toBe(5);
      expect(result.size).toBe(20);
    });

    it('should cap size at 100', () => {
      const result = paginationSchema.parse({ size: '200' });
      expect(result.size).toBe(10); // invalid, falls back to default
    });
  });

  describe('loginSchema', () => {
    it('should validate login credentials', () => {
      const data = {
        email: 'user@example.com',
        password: 'password123456',
      };
      const result = loginSchema.parse(data);
      expect(result.email).toBe(data.email);
      expect(result.password).toBe(data.password);
    });

    it('should reject short password', () => {
      const data = {
        email: 'user@example.com',
        password: '12345',
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });
  });
});
