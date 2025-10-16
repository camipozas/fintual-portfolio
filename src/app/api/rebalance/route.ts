import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rebalanceRequestSchema } from '@/lib/portfolio/dto/schemas';
import { plan } from '@/lib/portfolio/services/RebalanceService';

/**
 * Handles the POST request to the /api/rebalance endpoint
 * @param request - The Next.js request object
 * @returns The Next.js response object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = rebalanceRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { positions, allocation, prices, options } = validation.data;

    const result = plan(positions, allocation, prices, options);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

