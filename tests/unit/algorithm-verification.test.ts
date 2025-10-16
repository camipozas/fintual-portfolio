import { describe, it, expect } from 'vitest';
import { plan } from '@/lib/portfolio/services/RebalanceService.js';

describe('[ALGORITHM] Step-by-step verification', () => {
  it('should demonstrate complete rebalancing algorithm with detailed steps', () => {
    const positions = [
      { symbol: 'META', shares: 10 },
      { symbol: 'AAPL', shares: 5 },
      { symbol: 'NFLX', shares: 2 },
    ];

    const allocation = { META: 0.4, AAPL: 0.6 };
    const prices = { META: 350, AAPL: 180, NFLX: 600 };

    const metaValue = 10 * 350;
    const aaplValue = 5 * 180;
    const nflxValue = 2 * 600;
    const totalValue = metaValue + aaplValue + nflxValue;

    const result = plan(positions, allocation, prices, {
      fractional: true,
      band: 0.001,
      minNotional: 1,
    });

    expect(result.totalValue).toBe(totalValue);
    expect(Math.abs(result.net)).toBeLessThanOrEqual(0.01);

    const nflxOrder = result.orders.find(o => o.symbol === 'NFLX');
    expect(nflxOrder?.side).toBe('SELL');
    expect(nflxOrder?.shares).toBe(2);

    result.orders.forEach(order => {
      const expectedNotional = order.shares * order.price;
      expect(Math.abs(order.notional - expectedNotional)).toBeLessThan(0.01);
    });

    const sellFirst = result.orders.findIndex(o => o.side === 'SELL');
    const buyFirst = result.orders.findIndex(o => o.side === 'BUY');
    if (sellFirst >= 0 && buyFirst >= 0) {
      expect(sellFirst).toBeLessThan(buyFirst);
    }
  });

  it('should verify the net adjustment mechanism', () => {
    const result = plan(
      [{ symbol: 'A', shares: 100 }],
      { A: 0.5, B: 0.5 },
      { A: 100, B: 200 },
      { fractional: true, band: 0, minNotional: 0 },
    );

    expect(Math.abs(result.net)).toBeLessThanOrEqual(0.01);
  });

  it('should handle band tolerance correctly', () => {
    const result = plan(
      [{ symbol: 'A', shares: 50.01 }],
      { A: 1.0 },
      { A: 100 },
      { fractional: true, band: 0.001, minNotional: 0 },
    );

    expect(result.orders).toHaveLength(0);
  });
});

