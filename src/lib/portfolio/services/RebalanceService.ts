import type { Position, Prices, Weights, PlanOptions, PlanResult } from '../dto/types';
import { assertUnit } from '../helpers/weights';
import { buildRebalanceOrders, adjustNetToZero } from '../helpers/orders';

/**
 * Collects the symbols from the positions and allocation
 * @param positions - The positions
 * @param allocation - The allocation
 * @returns The symbols
 */
function collectSymbols(positions: Position[], allocation: Weights): string[] {
  const symbolSet = new Set<string>();
  positions.forEach(p => symbolSet.add(p.symbol));
  Object.keys(allocation).forEach(s => symbolSet.add(s));
  return Array.from(symbolSet);
}

/**
 * Calculates the total value of the positions
 * @param positions - The positions
 * @param prices - The prices
 * @returns The total value
 */
function calculateTotal(positions: Position[], prices: Prices): number {
  return positions.reduce((sum, p) => {
    const price = prices[p.symbol];
    if (!price || price <= 0) {
      throw new Error(`Missing or invalid price for ${p.symbol}`);
    }
    return sum + p.shares * price;
  }, 0);
}

/**
 * Calculates the net value of the orders
 * @param orders - The orders
 * @returns The net value
 */
function calculateNet(orders: PlanResult['orders']): number {
  const net = orders.reduce((sum, o) => {
    return sum + (o.side === 'BUY' ? -o.notional : o.notional);
  }, 0);
  return Math.round(net * 100) / 100;
}

/**
 * Plans the rebalance
 * @param positions - The positions
 * @param allocation - The allocation
 * @param prices - The prices
 * @param options - The options
 * @returns The plan result
 */
export function plan(
  positions: Position[],
  allocation: Weights,
  prices: Prices,
  options?: PlanOptions,
): PlanResult {
  const fractional = options?.fractional ?? true;
  const band = options?.band ?? 0.001;
  const minNotional = options?.minNotional ?? 0;

  assertUnit(allocation);

  const allSymbols = collectSymbols(positions, allocation);
  const positionsBySymbol = new Map(positions.map(p => [p.symbol, p]));
  const total = calculateTotal(positions, prices);

  const orders = buildRebalanceOrders({
    allSymbols,
    positionsBySymbol,
    prices,
    weights: allocation,
    total,
    band,
    fractional,
    minNotional,
  });

  adjustNetToZero(orders, fractional);

  return {
    orders,
    net: calculateNet(orders),
    totalValue: total,
  };
}

