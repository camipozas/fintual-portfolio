import type { Order, Position, Prices, Weights } from '../dto/types.js';

function roundShares(x: number, fractional: boolean): number {
  return fractional ? Math.round(x * 1e6) / 1e6 : Math.round(x);
}

function sortOrders(orders: Order[]): void {
  orders.sort((a, b) => {
    if (a.side !== b.side) return a.side === 'SELL' ? -1 : 1;
    return b.notional - a.notional;
  });
}

function calculateNetCash(orders: Order[]): number {
  return orders.reduce((sum, o) => {
    return sum + (o.side === 'BUY' ? -o.notional : o.notional);
  }, 0);
}

interface BuildOrdersParams {
  allSymbols: string[];
  positionsBySymbol: Map<string, Position>;
  prices: Prices;
  weights: Weights;
  total: number;
  band: number;
  fractional: boolean;
  minNotional: number;
}

export function buildRebalanceOrders({
  allSymbols,
  positionsBySymbol,
  prices,
  weights,
  total,
  band,
  fractional,
  minNotional,
}: BuildOrdersParams): Order[] {
  const orders: Order[] = [];

  for (const symbol of allSymbols) {
    const price = prices[symbol];
    if (!price || price <= 0) {
      throw new Error(`Missing or invalid price for ${symbol}`);
    }

    const targetWeight = weights[symbol] ?? 0;
    const targetValue = total * targetWeight;
    const currentShares = positionsBySymbol.get(symbol)?.shares ?? 0;
    const currentValue = currentShares * price;

    const diff = targetValue - currentValue;
    const threshold = targetValue * band;

    if (Math.abs(diff) <= threshold) continue;

    const shareDiff = diff / price;
    const shares = roundShares(Math.abs(shareDiff), fractional);
    const notional = shares * price;

    if (notional < minNotional) continue;

    orders.push({
      symbol,
      side: shareDiff > 0 ? 'BUY' : 'SELL',
      shares,
      price,
      notional,
    });
  }

  sortOrders(orders);
  return orders;
}

export function adjustNetToZero(orders: Order[], fractional: boolean): void {
  if (orders.length === 0) return;

  const net = calculateNetCash(orders);
  if (Math.abs(net) < 0.01) return;

  const targetSide = net > 0 ? 'BUY' : 'SELL';
  const pivot = orders.find((o) => o.side === targetSide);

  if (!pivot) return;

  const adjustment = Math.abs(net) / pivot.price;
  const newShares = roundShares(pivot.shares + adjustment, fractional);

  if (newShares <= 0) {
    const idx = orders.indexOf(pivot);
    orders.splice(idx, 1);
  } else {
    pivot.shares = newShares;
    pivot.notional = newShares * pivot.price;
  }
}
