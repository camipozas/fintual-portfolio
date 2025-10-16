# Portfolio Rebalancer

Calculate optimal buy/sell orders to rebalance a portfolio to target allocations.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the interactive UI or use the API at `/api/rebalance`.
Also, you can visit the homepage at <https://fintual-portfolio.vercel.app/>

## What It Does

Given current positions, target allocations, and prices, it calculates the minimum orders needed to rebalance your portfolio while keeping net cash flow at ~$0.

**Example:**

- You have: 10 META, 5 AAPL, 2 NFLX
- You want: 40% META, 60% AAPL
- Result: Sell 2 NFLX, buy 10.67 AAPL

## Tech Decisions

### Next.js 15 + TypeScript

- **Why**: Server-side rendering for better SEO, API routes for backend logic, and type safety throughout.
- **Benefit**: Single codebase for frontend and backend with excellent DX.

### Zod for Validation

- **Why**: Runtime type validation at API boundaries prevents invalid data from reaching business logic.
- **Benefit**: Type-safe schemas that catch errors early with clear error messages.

### Vitest for Testing

- **Why**: Fast, modern test runner with native ESM support and great TypeScript integration.
- **Benefit**: 30+ comprehensive tests covering edge cases and algorithm verification.

### Tailwind CSS

- **Why**: Utility-first CSS for rapid UI development without context switching.
- **Benefit**: Responsive, accessible UI with minimal custom CSS.

## Architecture

```
src/
├── app/
│   ├── api/rebalance/     # API endpoint
│   └── page.tsx           # Interactive form UI
├── lib/portfolio/
│   ├── helpers/           # Pure functions (no side effects)
│   ├── services/          # Business logic orchestration
│   └── dto/               # Schemas and types
└── components/            # UI components (single responsibility)
```

## API

**POST** `/api/rebalance`

```json
{
  "positions": [{ "symbol": "AAPL", "shares": 10 }],
  "allocation": { "AAPL": 0.6, "MSFT": 0.4 },
  "prices": { "AAPL": 180, "MSFT": 400 },
  "options": { "fractional": true, "band": 0.001, "minNotional": 1 }
}
```

**Options:**

- `fractional`: Allow fractional shares (default: `true`)
- `band`: Rebalance tolerance threshold (default: `0.001`)
- `minNotional`: Minimum order value (default: `0`)

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm test             # Run tests
npm run lint         # Lint code
npm run format:check # Check formatting
npm run validate     # Type check + tests
```

## LLM Conversation

You can find the LLM conversation [here](./LLM_CONVERSATION.md)
