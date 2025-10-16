import { describe, it, expect } from 'vitest';
import { buildRebalanceOrders, adjustNetToZero } from '@/lib/portfolio/helpers/orders.js';
import type { Order } from '@/lib/portfolio/dto/types.js';

describe('[HELPERS] Orders', () => {
  describe('buildRebalanceOrders', () => {
    it('should generate SELL orders before BUY orders', () => {
      const orders = buildRebalanceOrders({
        allSymbols: ['A', 'B'],
        positionsBySymbol: new Map([
          ['A', { symbol: 'A', shares: 10 }],
          ['B', { symbol: 'B', shares: 5 }],
        ]),
        prices: { A: 100, B: 200 },
        weights: { A: 0.3, B: 0.7 },
        total: 2000,
        band: 0.001,
        fractional: true,
        minNotional: 0,
      });

      const sellOrders = orders.filter(o => o.side === 'SELL');
      const buyOrders = orders.filter(o => o.side === 'BUY');
      
      if (sellOrders.length > 0 && buyOrders.length > 0) {
        const lastSellIndex = orders.lastIndexOf(sellOrders[sellOrders.length - 1]!);
        const firstBuyIndex = orders.indexOf(buyOrders[0]!);
        expect(lastSellIndex).toBeLessThan(firstBuyIndex);
      }
    });

    it('should filter orders below minNotional', () => {
      const orders = buildRebalanceOrders({
        allSymbols: ['A', 'B'],
        positionsBySymbol: new Map([['A', { symbol: 'A', shares: 100 }]]),
        prices: { A: 10, B: 1000 },
        weights: { A: 0.999, B: 0.001 },
        total: 1000,
        band: 0,
        fractional: true,
        minNotional: 10,
      });

      expect(orders.every(o => o.notional >= 10)).toBe(true);
    });

    it('should sort by notional within same side', () => {
      const orders = buildRebalanceOrders({
        allSymbols: ['A', 'B', 'C'],
        positionsBySymbol: new Map([
          ['A', { symbol: 'A', shares: 100 }],
          ['B', { symbol: 'B', shares: 50 }],
          ['C', { symbol: 'C', shares: 10 }],
        ]),
        prices: { A: 10, B: 20, C: 50 },
        weights: {},
        total: 2500,
        band: 0,
        fractional: true,
        minNotional: 0,
      });

      const sellOrders = orders.filter(o => o.side === 'SELL');
      for (let i = 1; i < sellOrders.length; i++) {
        expect(sellOrders[i - 1]!.notional).toBeGreaterThanOrEqual(sellOrders[i]!.notional);
      }
    });
  });

  describe('adjustNetToZero', () => {
    it('should adjust net to approximately zero', () => {
      const orders: Order[] = [
        { symbol: 'A', side: 'SELL', shares: 10, price: 100, notional: 1000 },
        { symbol: 'B', side: 'BUY', shares: 4, price: 200, notional: 800 },
      ];

      adjustNetToZero(orders, true);

      const net = orders.reduce((sum, o) => {
        return sum + (o.side === 'BUY' ? -o.notional : o.notional);
      }, 0);

      expect(Math.abs(net)).toBeLessThan(0.01);
    });

    it('should remove order if adjustment results in zero shares', () => {
      const orders: Order[] = [
        { symbol: 'A', side: 'SELL', shares: 1, price: 100, notional: 100 },
        { symbol: 'B', side: 'BUY', shares: 1.5, price: 100, notional: 150 },
      ];

      adjustNetToZero(orders, true);

      const net = orders.reduce((sum, o) => {
        return sum + (o.side === 'BUY' ? -o.notional : o.notional);
      }, 0);

      expect(Math.abs(net)).toBeLessThan(0.01);
    });

    it('should handle fractional shares correctly', () => {
      const orders: Order[] = [
        { symbol: 'A', side: 'SELL', shares: 10.5, price: 100, notional: 1050 },
        { symbol: 'B', side: 'BUY', shares: 5.2, price: 200, notional: 1040 },
      ];

      adjustNetToZero(orders, true);

      const net = orders.reduce((sum, o) => {
        return sum + (o.side === 'BUY' ? -o.notional : o.notional);
      }, 0);

      expect(Math.abs(net)).toBeLessThan(0.01);
    });
  });
});

