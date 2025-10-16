export interface Position {
  symbol: string;
  shares: number;
}

export type Prices = Record<string, number>;
export type Weights = Record<string, number>;

export interface Order {
  symbol: string;
  side: 'BUY' | 'SELL';
  shares: number;
  price: number;
  notional: number;
}

export interface PlanOptions {
  fractional?: boolean | undefined;
  band?: number | undefined;
  minNotional?: number | undefined;
}

export interface PlanResult {
  orders: Order[];
  net: number;
  totalValue: number;
}
