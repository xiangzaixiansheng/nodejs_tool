import { describe, it, expect } from 'vitest';
import { sortBy, arrayChunk } from '../util/arrayTool';

describe('ArrayTool', () => {
  describe('sortBy', () => {
    it('should sort numbers in ascending order', () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6];
      const result = sortBy(input);
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
    });

    it('should sort numbers in descending order', () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6];
      const result = sortBy(input, (x) => -x);
      expect(result).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
    });

    it('should sort objects by key', () => {
      const input = [{ age: 30 }, { age: 20 }, { age: 40 }];
      const result = sortBy(input, (x) => x.age);
      expect(result).toEqual([{ age: 20 }, { age: 30 }, { age: 40 }]);
    });
  });

  describe('arrayChunk', () => {
    it('should chunk array into smaller arrays', () => {
      const input = [1, 2, 3, 4, 5, 6];
      const result = arrayChunk(input, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should handle uneven chunks', () => {
      const input = [1, 2, 3, 4, 5];
      const result = arrayChunk(input, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should return empty array for empty input', () => {
      const result = arrayChunk([], 2);
      expect(result).toEqual([]);
    });
  });
});
