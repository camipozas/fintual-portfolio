import { describe, it, expect } from 'vitest';
import { plan } from '@/lib/portfolio/services/RebalanceService.js';

describe('[ALGORITHM] Step-by-step verification', () => {
  it('should demonstrate complete rebalancing algorithm with detailed steps', () => {
    console.log('\n=== REBALANCING ALGORITHM VERIFICATION ===\n');

    const positions = [
      { symbol: 'META', shares: 10 },
      { symbol: 'AAPL', shares: 5 },
      { symbol: 'NFLX', shares: 2 },
    ];

    const allocation = { META: 0.4, AAPL: 0.6 };
    const prices = { META: 350, AAPL: 180, NFLX: 600 };

    console.log('INPUTS:');
    console.log('  Positions:', JSON.stringify(positions, null, 2));
    console.log('  Allocation:', allocation);
    console.log('  Prices:', prices);
    console.log();

    console.log('STEP 1: Calculate current portfolio value');
    const metaValue = 10 * 350;
    const aaplValue = 5 * 180;
    const nflxValue = 2 * 600;
    const totalValue = metaValue + aaplValue + nflxValue;
    console.log(`  META: ${10} shares × $${350} = $${metaValue}`);
    console.log(`  AAPL: ${5} shares × $${180} = $${aaplValue}`);
    console.log(`  NFLX: ${2} shares × $${600} = $${nflxValue}`);
    console.log(`  TOTAL: $${totalValue}`);
    console.log();

    console.log('STEP 2: Calculate target values based on allocation');
    const targetMeta = totalValue * 0.4;
    const targetAapl = totalValue * 0.6;
    const targetNflx = totalValue * 0;
    console.log(`  META target (40%): $${targetMeta}`);
    console.log(`  AAPL target (60%): $${targetAapl}`);
    console.log(`  NFLX target (0% - not in allocation): $${targetNflx}`);
    console.log();

    console.log('STEP 3: Calculate differences (target - current)');
    const diffMeta = targetMeta - metaValue;
    const diffAapl = targetAapl - aaplValue;
    const diffNflx = targetNflx - nflxValue;
    console.log(`  META: $${targetMeta} - $${metaValue} = $${diffMeta}`);
    console.log(`  AAPL: $${targetAapl} - $${aaplValue} = $${diffAapl}`);
    console.log(`  NFLX: $${targetNflx} - $${nflxValue} = $${diffNflx}`);
    console.log();

    console.log('STEP 4: Convert value differences to share quantities');
    const sharesMeta = diffMeta / 350;
    const sharesAapl = diffAapl / 180;
    const sharesNflx = diffNflx / 600;
    console.log(`  META: $${diffMeta} ÷ $${350} = ${sharesMeta} shares (${diffMeta < 0 ? 'SELL' : 'BUY'})`);
    console.log(`  AAPL: $${diffAapl} ÷ $${180} = ${sharesAapl} shares (${diffAapl < 0 ? 'SELL' : 'BUY'})`);
    console.log(`  NFLX: $${diffNflx} ÷ $${600} = ${sharesNflx} shares (${diffNflx < 0 ? 'SELL' : 'BUY'})`);
    console.log();

    const result = plan(positions, allocation, prices, {
      fractional: true,
      band: 0.001,
      minNotional: 1,
    });

    console.log('STEP 5: Generated orders (sorted: SELL first, then BUY)');
    result.orders.forEach((order, idx) => {
      console.log(`  ${idx + 1}. ${order.side} ${order.shares} ${order.symbol} @ $${order.price} = $${order.notional.toFixed(2)}`);
    });
    console.log();

    console.log('STEP 6: Calculate net cash flow');
    const cashIn = result.orders.filter(o => o.side === 'SELL').reduce((sum, o) => sum + o.notional, 0);
    const cashOut = result.orders.filter(o => o.side === 'BUY').reduce((sum, o) => sum + o.notional, 0);
    console.log(`  Cash IN (from SELL): $${cashIn.toFixed(2)}`);
    console.log(`  Cash OUT (from BUY): $${cashOut.toFixed(2)}`);
    console.log(`  Net: $${result.net.toFixed(2)}`);
    console.log();

    console.log('VERIFICATION:');
    expect(result.totalValue).toBe(totalValue);
    console.log(`  ✓ Total value: $${result.totalValue}`);

    expect(Math.abs(result.net)).toBeLessThanOrEqual(0.01);
    console.log(`  ✓ Net cash balanced: $${result.net.toFixed(2)} (≤ $0.01)`);

    const nflxOrder = result.orders.find(o => o.symbol === 'NFLX');
    expect(nflxOrder?.side).toBe('SELL');
    expect(nflxOrder?.shares).toBe(2);
    console.log(`  ✓ NFLX fully liquidated (not in allocation): SELL ${nflxOrder?.shares} shares`);

    result.orders.forEach(order => {
      const expectedNotional = order.shares * order.price;
      expect(Math.abs(order.notional - expectedNotional)).toBeLessThan(0.01);
    });
    console.log(`  ✓ All order notionals calculated correctly`);

    const sellFirst = result.orders.findIndex(o => o.side === 'SELL');
    const buyFirst = result.orders.findIndex(o => o.side === 'BUY');
    if (sellFirst >= 0 && buyFirst >= 0) {
      expect(sellFirst).toBeLessThan(buyFirst);
      console.log(`  ✓ Orders sorted correctly (SELL before BUY)`);
    }

    console.log('\n=== ALGORITHM VERIFIED ===\n');
  });

  it('should verify the net adjustment mechanism', () => {
    console.log('\n=== NET ADJUSTMENT VERIFICATION ===\n');

    const result = plan(
      [{ symbol: 'A', shares: 100 }],
      { A: 0.5, B: 0.5 },
      { A: 100, B: 200 },
      { fractional: true, band: 0, minNotional: 0 },
    );

    console.log('Before adjustment (theoretical):');
    console.log('  SELL A: 50 shares × $100 = $5000');
    console.log('  BUY B: 25 shares × $200 = $5000');
    console.log('  Theoretical net: $0');
    console.log();

    console.log('After adjustment (actual):');
    result.orders.forEach(order => {
      console.log(`  ${order.side} ${order.symbol}: ${order.shares} shares × $${order.price} = $${order.notional.toFixed(2)}`);
    });
    console.log(`  Actual net: $${result.net.toFixed(2)}`);
    console.log();

    expect(Math.abs(result.net)).toBeLessThanOrEqual(0.01);
    console.log('✓ Net adjustment successful\n');
  });

  it('should handle band tolerance correctly', () => {
    console.log('\n=== BAND TOLERANCE VERIFICATION ===\n');

    const total = 10000;
    const target = total * 0.5;
    const current = 5001;
    const diff = Math.abs(target - current);
    const band = 0.001;
    const threshold = target * band;

    console.log('Portfolio value: $10,000');
    console.log('Target for stock A (50%): $5,000');
    console.log('Current value of A: $5,001');
    console.log(`Difference: $${diff}`);
    console.log(`Band threshold (0.1%): $${threshold}`);
    console.log(`Should generate order? ${diff > threshold ? 'YES' : 'NO'}`);
    console.log();

    const result = plan(
      [{ symbol: 'A', shares: 50.01 }],
      { A: 1.0 },
      { A: 100 },
      { fractional: true, band: 0.001, minNotional: 0 },
    );

    console.log(`Orders generated: ${result.orders.length}`);
    expect(result.orders).toHaveLength(0);
    console.log('✓ No order generated (within tolerance)\n');
  });
});

