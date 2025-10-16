export interface PositionInput {
  symbol: string;
  shares: string;
}

export interface AllocationInput {
  symbol: string;
  weight: string;
}

export interface PriceInput {
  symbol: string;
  price: string;
}

export interface RebalanceOptions {
  fractional: boolean;
  band: string;
  minNotional: string;
}

