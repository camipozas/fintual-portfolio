import { describe, it, expect } from 'vitest';
import { sumWeights, assertUnit } from '@/lib/portfolio/helpers/weights.js';

describe('[HELPERS] Weights', () => {
  describe('sumWeights', () => {
    it('should sum weights correctly', () => {
      expect(sumWeights({ A: 0.4, B: 0.6 })).toBe(1.0);
      expect(sumWeights({ A: 0.25, B: 0.25, C: 0.5 })).toBe(1.0);
    });

    it('should handle empty weights', () => {
      expect(sumWeights({})).toBe(0);
    });
  });

  describe('assertUnit', () => {
    it('should pass when weights sum to 1', () => {
      expect(() => assertUnit({ A: 0.4, B: 0.6 })).not.toThrow();
      expect(() => assertUnit({ A: 1.0 })).not.toThrow();
    });

    it('should pass within tolerance', () => {
      expect(() => assertUnit({ A: 0.4, B: 0.6000000001 })).not.toThrow();
    });

    it('should throw when weights do not sum to 1', () => {
      expect(() => assertUnit({ A: 0.4, B: 0.5 })).toThrow('must sum to 1');
      expect(() => assertUnit({ A: 0.5, B: 0.6 })).toThrow('must sum to 1');
    });

    it('should throw when sum is too far off', () => {
      expect(() => assertUnit({ A: 0.4, B: 0.601 })).toThrow();
    });
  });
});

