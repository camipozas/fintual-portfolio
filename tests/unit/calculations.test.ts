import { describe, it, expect } from 'vitest';
import { plan } from '@/lib/portfolio/services/RebalanceService.js';

describe('[VALIDATION] Manual calculation verification', () => {
  it('should calculate correctly: example with META/AAPL/NFLX', () => {
    const result = plan(
      [
        { symbol: 'META', shares: 10 },
        { symbol: 'AAPL', shares: 5 },
        { symbol: 'NFLX', shares: 2 },
      ],
      { META: 0.4, AAPL: 0.6 },
      { META: 350, AAPL: 180, NFLX: 600 },
      { fractional: true, band: 0.001, minNotional: 1 }
    );

    const currentTotal = 10 * 350 + 5 * 180 + 2 * 600;
    expect(currentTotal).toBe(5600);
    expect(result.totalValue).toBe(5600);

    const targetMETA = currentTotal * 0.4;
    const targetAAPL = currentTotal * 0.6;
    const targetNFLX = currentTotal * 0;

    expect(targetMETA).toBe(2240);
    expect(targetAAPL).toBe(3360);
    expect(targetNFLX).toBe(0);

    const currentMETA = 10 * 350;
    const currentAAPL = 5 * 180;
    const currentNFLX = 2 * 600;

    expect(currentMETA).toBe(3500);
    expect(currentAAPL).toBe(900);
    expect(currentNFLX).toBe(1200);

    const diffMETA = targetMETA - currentMETA;
    const diffAAPL = targetAAPL - currentAAPL;
    const diffNFLX = targetNFLX - currentNFLX;

    expect(diffMETA).toBe(-1260);
    expect(diffAAPL).toBe(2460);
    expect(diffNFLX).toBe(-1200);

    const nflxOrder = result.orders.find((o) => o.symbol === 'NFLX');
    expect(nflxOrder?.side).toBe('SELL');
    expect(nflxOrder?.shares).toBe(2);
    expect(nflxOrder?.notional).toBe(1200);

    const metaOrder = result.orders.find((o) => o.symbol === 'META');
    expect(metaOrder?.side).toBe('SELL');
    expect(Math.abs(metaOrder!.shares - 1260 / 350)).toBeLessThan(0.01);

    const aaplOrder = result.orders.find((o) => o.symbol === 'AAPL');
    expect(aaplOrder?.side).toBe('BUY');
    expect(Math.abs(aaplOrder!.shares - 2460 / 180)).toBeLessThan(0.01);

    const netCash = result.orders.reduce((sum, o) => {
      return sum + (o.side === 'BUY' ? -o.notional : o.notional);
    }, 0);
    expect(Math.abs(netCash)).toBeLessThanOrEqual(0.01);
  });

  it('should handle simple 50/50 rebalance correctly', () => {
    const result = plan(
      [
        { symbol: 'A', shares: 100 },
        { symbol: 'B', shares: 0 },
      ],
      { A: 0.5, B: 0.5 },
      { A: 100, B: 200 },
      { fractional: true, band: 0, minNotional: 0 }
    );

    const total = 100 * 100;
    expect(result.totalValue).toBe(10000);

    const targetA = total * 0.5;
    const targetB = total * 0.5;

    expect(targetA).toBe(5000);
    expect(targetB).toBe(5000);

    const orderA = result.orders.find((o) => o.symbol === 'A');
    const orderB = result.orders.find((o) => o.symbol === 'B');

    expect(orderA?.side).toBe('SELL');
    expect(orderA?.shares).toBe(50);
    expect(orderA?.notional).toBe(5000);

    expect(orderB?.side).toBe('BUY');
    expect(orderB?.shares).toBe(25);
    expect(orderB?.notional).toBe(5000);

    expect(Math.abs(result.net)).toBeLessThanOrEqual(0.01);
  });

  it('should verify net calculation is correct', () => {
    const result = plan(
      [
        { symbol: 'A', shares: 10 },
        { symbol: 'B', shares: 10 },
      ],
      { A: 0.7, B: 0.3 },
      { A: 100, B: 100 },
      { fractional: true, band: 0, minNotional: 0 }
    );

    const total = 10 * 100 + 10 * 100;
    expect(total).toBe(2000);

    const targetA = 2000 * 0.7;
    const targetB = 2000 * 0.3;

    expect(targetA).toBe(1400);
    expect(targetB).toBe(600);

    const currentA = 10 * 100;
    const currentB = 10 * 100;

    expect(currentA).toBe(1000);
    expect(currentB).toBe(1000);

    const diffA = targetA - currentA;
    const diffB = targetB - currentB;

    expect(diffA).toBe(400);
    expect(diffB).toBe(-400);

    const orderA = result.orders.find((o) => o.symbol === 'A');
    const orderB = result.orders.find((o) => o.symbol === 'B');

    expect(orderA?.side).toBe('BUY');
    expect(orderB?.side).toBe('SELL');

    expect(orderA?.shares).toBe(4);
    expect(orderB?.shares).toBe(4);

    expect(orderA?.notional).toBe(400);
    expect(orderB?.notional).toBe(400);

    expect(result.net).toBe(0);
  });

  it('should handle band tolerance correctly', () => {
    const result = plan(
      [{ symbol: 'A', shares: 100 }],
      { A: 1.0 },
      { A: 100 },
      { fractional: true, band: 0.01, minNotional: 0 }
    );

    expect(result.orders).toHaveLength(0);
  });

  it('should generate order when outside band', () => {
    const result = plan(
      [
        { symbol: 'A', shares: 100 },
        { symbol: 'B', shares: 0 },
      ],
      { A: 0.99, B: 0.01 },
      { A: 100, B: 100 },
      { fractional: true, band: 0.001, minNotional: 0 }
    );

    const total = 10000;
    const targetA = total * 0.99;
    const targetB = total * 0.01;
    const currentA = 10000;
    const currentB = 0;

    const diffA = targetA - currentA;
    const diffB = targetB - currentB;

    expect(diffA).toBe(-100);
    expect(diffB).toBe(100);

    const thresholdA = targetA * 0.001;
    const thresholdB = targetB * 0.001;

    expect(thresholdA).toBe(9.9);
    expect(thresholdB).toBe(0.1);

    expect(Math.abs(diffA)).toBeGreaterThan(thresholdA);
    expect(Math.abs(diffB)).toBeGreaterThan(thresholdB);

    expect(result.orders.length).toBeGreaterThan(0);
  });
});
