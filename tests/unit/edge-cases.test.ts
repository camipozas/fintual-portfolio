import { describe, it, expect } from 'vitest';
import { plan } from '@/lib/portfolio/services/RebalanceService.js';

describe('[EDGE CASES] Symbol handling', () => {
  it('should handle symbol ONLY in positions (not in allocation) - should sell all', () => {
    const result = plan(
      [{ symbol: 'TSLA', shares: 10 }],
      { AAPL: 1.0 },
      { TSLA: 300, AAPL: 180 },
      { fractional: true, band: 0, minNotional: 0 },
    );

    console.log('\n=== Symbol only in positions ===');
    console.log('Positions: TSLA 10 shares');
    console.log('Allocation: AAPL 100%');
    console.log('Expected: SELL all TSLA, BUY AAPL with proceeds');
    console.log('Orders:', result.orders);

    const tslaOrder = result.orders.find(o => o.symbol === 'TSLA');
    const aaplOrder = result.orders.find(o => o.symbol === 'AAPL');

    expect(tslaOrder?.side).toBe('SELL');
    expect(tslaOrder?.shares).toBe(10);

    expect(aaplOrder?.side).toBe('BUY');
  });

  it('should handle symbol ONLY in allocation (not in positions) - should buy', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 10 }],
      { AAPL: 0.5, META: 0.5 },
      { AAPL: 180, META: 350 },
      { fractional: true, band: 0, minNotional: 0 },
    );

    console.log('\n=== Symbol only in allocation ===');
    console.log('Positions: AAPL 10 shares ($1800)');
    console.log('Allocation: 50% AAPL, 50% META');
    console.log('Expected: SELL some AAPL, BUY META');
    console.log('Orders:', result.orders);

    const metaOrder = result.orders.find(o => o.symbol === 'META');
    expect(metaOrder?.side).toBe('BUY');
    expect(metaOrder?.notional).toBeCloseTo(900, 1);
  });

  it('should handle symbol ONLY in prices (not in positions or allocation) - should ignore', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 10 }],
      { AAPL: 1.0 },
      { AAPL: 180, TSLA: 300, META: 350 },
      { fractional: true, band: 0.001, minNotional: 0 },
    );

    console.log('\n=== Extra symbols in prices ===');
    console.log('Positions: AAPL only');
    console.log('Allocation: AAPL 100%');
    console.log('Prices: AAPL, TSLA, META');
    console.log('Expected: No orders (already balanced), extra prices ignored');
    console.log('Orders:', result.orders);

    expect(result.orders).toHaveLength(0);
  });

  it('should throw error if symbol in positions but price missing', () => {
    console.log('\n=== Missing price for position ===');

    expect(() =>
      plan(
        [{ symbol: 'AAPL', shares: 10 }],
        { AAPL: 1.0 },
        {},
      ),
    ).toThrow('Missing or invalid price');
  });

  it('should throw error if symbol in allocation but price missing', () => {
    console.log('\n=== Missing price for allocation ===');

    expect(() =>
      plan(
        [{ symbol: 'AAPL', shares: 10 }],
        { AAPL: 0.5, META: 0.5 },
        { AAPL: 180 },
      ),
    ).toThrow('Missing or invalid price');
  });

  it('should handle multiple new symbols in allocation', () => {
    const result = plan(
      [{ symbol: 'AAPL', shares: 100 }],
      { AAPL: 0.4, META: 0.3, TSLA: 0.3 },
      { AAPL: 100, META: 200, TSLA: 300 },
      { fractional: true, band: 0, minNotional: 0 },
    );

    console.log('\n=== Multiple new symbols ===');
    console.log('Starting with AAPL only ($10,000)');
    console.log('Target: 40% AAPL, 30% META, 30% TSLA');
    console.log('Orders:', result.orders);

    const aaplOrder = result.orders.find(o => o.symbol === 'AAPL');
    const metaOrder = result.orders.find(o => o.symbol === 'META');
    const tslaOrder = result.orders.find(o => o.symbol === 'TSLA');

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
      { fractional: true, band: 0, minNotional: 0 },
    );

    console.log('\n=== Empty positions ===');
    console.log('Starting with no positions');
    console.log('Target: 100% AAPL');
    console.log('Orders:', result.orders);
    console.log('Total value:', result.totalValue);

    expect(result.totalValue).toBe(0);
    expect(result.orders).toHaveLength(0);
  });

  it('should validate symbol consistency across positions and allocation', () => {
    console.log('\n=== Symbol validation test ===');

    const result = plan(
      [
        { symbol: 'AAPL', shares: 10 },
        { symbol: 'META', shares: 5 },
        { symbol: 'TSLA', shares: 3 },
      ],
      { AAPL: 0.6, GOOGL: 0.4 },
      { AAPL: 180, META: 350, TSLA: 300, GOOGL: 140 },
    );

    console.log('Positions: AAPL, META, TSLA');
    console.log('Allocation: AAPL (60%), GOOGL (40%)');
    console.log('Expected: SELL META & TSLA (not in allocation), BUY GOOGL (new)');
    console.log('Orders:', result.orders);

    const metaOrder = result.orders.find(o => o.symbol === 'META');
    const tslaOrder = result.orders.find(o => o.symbol === 'TSLA');
    const googlOrder = result.orders.find(o => o.symbol === 'GOOGL');

    expect(metaOrder?.side).toBe('SELL');
    expect(metaOrder?.shares).toBe(5);

    expect(tslaOrder?.side).toBe('SELL');
    expect(tslaOrder?.shares).toBe(3);

    expect(googlOrder?.side).toBe('BUY');
  });
});

