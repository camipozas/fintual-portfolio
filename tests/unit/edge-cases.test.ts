import { describe, it, expect } from 'vitest';
import { plan } from '@/lib/portfolio/services/RebalanceService.js';

describe('[EDGE CASES] Symbol handling', () => {
  it('should handle symbol ONLY in positions (not in allocation) - should sell all', () => {
    const result = plan(
      [{ symbol: 'TSLA', shares: 10 }],
      { AAPL: 1.0 },
      { TSLA: 300, AAPL: 180 },
      { fractional: true, band: 0, minNotional: 0 }
    );

    const tslaOrder = result.orders.find((o) => o.symbol === 'TSLA');
    const aaplOrder = result.orders.find((o) => o.symbol === 'AAPL');

    expect(tslaOrder?.side).toBe('SELL');
    expect(tslaOrder?.shares).toBe(10);

    expect(aaplOrder?.side).toBe('BUY');
  });

  it('should handle symbol ONLY in allocation (not in positions) - should buy', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 10 }],
      { AAPL: 0.5, META: 0.5 },
      { AAPL: 180, META: 350 },
      { fractional: true, band: 0, minNotional: 0 }
    );

    const metaOrder = result.orders.find((o) => o.symbol === 'META');
    expect(metaOrder?.side).toBe('BUY');
    expect(metaOrder?.notional).toBeCloseTo(900, 1);
  });

  it('should handle symbol ONLY in prices (not in positions or allocation) - should ignore', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 10 }],
      { AAPL: 1.0 },
      { AAPL: 180, TSLA: 300, META: 350 },
      { fractional: true, band: 0.001, minNotional: 0 }
    );

    expect(result.orders).toHaveLength(0);
  });

  it('should throw error if symbol in positions but price missing', () => {
    expect(() => plan([{ symbol: 'AAPL', shares: 10 }], { AAPL: 1.0 }, {})).toThrow(
      'Missing or invalid price'
    );
  });

  it('should throw error if symbol in allocation but price missing', () => {
    expect(() =>
      plan([{ symbol: 'AAPL', shares: 10 }], { AAPL: 0.5, META: 0.5 }, { AAPL: 180 })
    ).toThrow('Missing or invalid price');
  });

  it('should handle multiple new symbols in allocation', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 100 }],
      { AAPL: 0.4, META: 0.3, TSLA: 0.3 },
      { AAPL: 100, META: 200, TSLA: 300 },
      { fractional: true, band: 0, minNotional: 0 }
    );

    const aaplOrder = result.orders.find((o) => o.symbol === 'AAPL');
    const metaOrder = result.orders.find((o) => o.symbol === 'META');
    const tslaOrder = result.orders.find((o) => o.symbol === 'TSLA');

    expect(aaplOrder?.side).toBe('SELL');
    expect(metaOrder?.side).toBe('BUY');
    expect(tslaOrder?.side).toBe('BUY');

    expect(metaOrder?.notional).toBeCloseTo(3000, 1);
    expect(tslaOrder?.notional).toBeCloseTo(3000, 1);
  });

  it('should handle empty positions with allocation', () => {
    const result = plan(
      [],
      { AAPL: 1.0 },
      { AAPL: 180 },
      { fractional: true, band: 0, minNotional: 0 }
    );

    expect(result.totalValue).toBe(0);
    expect(result.orders).toHaveLength(0);
  });

  it('should validate symbol consistency across positions and allocation', () => {
    const result = plan(
      [
        { symbol: 'AAPL', shares: 10 },
        { symbol: 'META', shares: 5 },
        { symbol: 'TSLA', shares: 3 },
      ],
      { AAPL: 0.6, GOOGL: 0.4 },
      { AAPL: 180, META: 350, TSLA: 300, GOOGL: 140 }
    );

    const metaOrder = result.orders.find((o) => o.symbol === 'META');
    const tslaOrder = result.orders.find((o) => o.symbol === 'TSLA');
    const googlOrder = result.orders.find((o) => o.symbol === 'GOOGL');

    expect(metaOrder?.side).toBe('SELL');
    expect(metaOrder?.shares).toBe(5);

    expect(tslaOrder?.side).toBe('SELL');
    expect(tslaOrder?.shares).toBe(3);

    expect(googlOrder?.side).toBe('BUY');
  });
});
