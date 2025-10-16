import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/rebalance/route.js';
import { NextRequest } from 'next/server';
import type { Order } from '@/lib/portfolio/dto/types';

describe('POST /api/rebalance', () => {
  it('should return a valid rebalance plan', async () => {
    const request = new NextRequest('http://localhost:3000/api/rebalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: [
          { symbol: 'META', shares: 10 },
          { symbol: 'AAPL', shares: 5 },
          { symbol: 'NFLX', shares: 2 },
        ],
        allocation: { META: 0.4, AAPL: 0.6 },
        prices: { META: 350, AAPL: 180, NFLX: 600 },
        options: { fractional: true, band: 0.001, minNotional: 1 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('orders');
    expect(data).toHaveProperty('net');
    expect(data).toHaveProperty('totalValue');
    expect(Array.isArray(data.orders)).toBe(true);
    expect(Math.abs(data.net)).toBeLessThanOrEqual(0.01);

    const nflxOrder = data.orders.find((o: Order) => o.symbol === 'NFLX');
    expect(nflxOrder?.side).toBe('SELL');
    expect(nflxOrder?.shares).toBe(2);
  });

  it('should return 400 for invalid allocation sum', async () => {
    const request = new NextRequest('http://localhost:3000/api/rebalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: [{ symbol: 'AAPL', shares: 10 }],
        allocation: { AAPL: 0.5, META: 0.4 },
        prices: { AAPL: 180, META: 350 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('must sum to 1');
  });

  it('should return 400 for invalid request schema', async () => {
    const request = new NextRequest('http://localhost:3000/api/rebalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: 'invalid',
        allocation: { AAPL: 0.5 },
        prices: { AAPL: 180 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for negative price', async () => {
    const request = new NextRequest('http://localhost:3000/api/rebalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: [{ symbol: 'AAPL', shares: 10 }],
        allocation: { AAPL: 1.0 },
        prices: { AAPL: -180 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });
});

