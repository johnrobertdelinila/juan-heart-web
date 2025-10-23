import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional class names', () => {
      const result = cn('class1', false && 'class2', 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class3');
      expect(result).not.toContain('class2');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      // Should keep only px-4 (last px value wins)
      expect(result).toContain('px-4');
      expect(result).toContain('py-1');
    });

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should work with objects', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
      });
      expect(result).toContain('text-red-500');
      expect(result).not.toContain('text-blue-500');
    });
  });
});
