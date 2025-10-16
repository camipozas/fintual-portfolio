import { z } from 'zod';

export const positionSchema = z.object({
  symbol: z.string().min(1),
  shares: z.number().nonnegative(),
});

export const planOptionsSchema = z.object({
  fractional: z.boolean().optional(),
  band: z.number().positive().optional(),
  minNotional: z.number().nonnegative().optional(),
});

export const rebalanceRequestSchema = z.object({
  positions: z.array(positionSchema),
  allocation: z.record(z.string(), z.number()),
  prices: z.record(z.string(), z.number().positive()),
  options: planOptionsSchema.optional(),
});

export const orderSchema = z.object({
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  shares: z.number().positive(),
  price: z.number().positive(),
  notional: z.number().positive(),
});

export const rebalanceResponseSchema = z.object({
  orders: z.array(orderSchema),
  net: z.number(),
  totalValue: z.number(),
});
