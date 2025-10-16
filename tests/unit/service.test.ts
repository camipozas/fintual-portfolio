import { describe, it, expect } from 'vitest';
import { plan } from '@/lib/portfolio/services/RebalanceService.js';

describe('[SERVICES] RebalanceService', () => {
  it('should liquidate symbols not in allocation', () => {
    const result = plan(
      [
        { symbol: 'META', shares: 10 },
        { symbol: 'AAPL', shares: 5 },
        { symbol: 'NFLX', shares: 2 },
      ],
      { META: 0.4, AAPL: 0.6 },
      { META: 350, AAPL: 180, NFLX: 600 }
    );

    const nflxOrder = result.orders.find((o) => o.symbol === 'NFLX');
    expect(nflxOrder).toBeDefined();
    expect(nflxOrder?.side).toBe('SELL');
    expect(nflxOrder?.shares).toBe(2);
  });

  it('should respect fractional=false by rounding to integers', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 10 }],
      { AAPL: 0.5, META: 0.5 },
      { AAPL: 180, META: 350 },
      { fractional: false }
    );

    result.orders.forEach((order) => {
      expect(order.shares % 1).toBe(0);
    });
  });

  it('should achieve net close to zero', () => {
    const result = plan(
      [
        { symbol: 'META', shares: 10 },
        { symbol: 'AAPL', shares: 5 },
      ],
      { META: 0.4, AAPL: 0.6 },
      { META: 350, AAPL: 180 }
    );

    expect(Math.abs(result.net)).toBeLessThanOrEqual(0.01);
  });

  it('should calculate total value correctly', () => {
    const result = plan(
      [
        { symbol: 'META', shares: 10 },
        { symbol: 'AAPL', shares: 5 },
      ],
      { META: 0.5, AAPL: 0.5 },
      { META: 350, AAPL: 180 }
    );

    expect(result.totalValue).toBe(10 * 350 + 5 * 180);
  });

  it('should throw on invalid allocation sum', () => {
    expect(() =>
      plan([{ symbol: 'AAPL', shares: 10 }], { AAPL: 0.5, META: 0.4 }, { AAPL: 180, META: 350 })
    ).toThrow('must sum to 1');
  });

  it('should throw on missing price', () => {
    expect(() => plan([{ symbol: 'AAPL', shares: 10 }], { AAPL: 1.0 }, {})).toThrow(
      'Missing or invalid price'
    );
  });

  it('should throw on invalid price', () => {
    expect(() => plan([{ symbol: 'AAPL', shares: 10 }], { AAPL: 1.0 }, { AAPL: 0 })).toThrow(
      'Missing or invalid price'
    );
  });
});
