# Portfolio Rebalance Module

A Next.js portfolio rebalancing module built with SOLID principles, TypeScript, and comprehensive testing.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The development server will start at `http://localhost:3000`.

Open `http://localhost:3000` to use the interactive form for testing the API.

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch
```

## API Usage

You can test the API using:

- **Web Form**: Visit `http://localhost:3000` and fill out the interactive form
- **cURL/API client**: See example below

### POST /api/rebalance

Calculates rebalancing orders to achieve target allocation.

**Request Body:**

```json
{
  "positions": [
    { "symbol": "META", "shares": 10 },
    { "symbol": "AAPL", "shares": 5 },
    { "symbol": "NFLX", "shares": 2 }
  ],
  "allocation": {
    "META": 0.4,
    "AAPL": 0.6
  },
  "prices": {
    "META": 350,
    "AAPL": 180,
    "NFLX": 600
  },
  "options": {
    "fractional": true,
    "band": 0.001,
    "minNotional": 1
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/rebalance \
  -H "Content-Type: application/json" \
  -d '{
    "positions":[{"symbol":"META","shares":10},{"symbol":"AAPL","shares":5},{"symbol":"NFLX","shares":2}],
    "allocation":{"META":0.4,"AAPL":0.6},
    "prices":{"META":350,"AAPL":180,"NFLX":600},
    "options":{"fractional":true,"band":0.001,"minNotional":1}
  }'
```

**Response:**

```json
{
  "orders": [
    {
      "symbol": "NFLX",
      "side": "SELL",
      "shares": 2,
      "price": 600,
      "notional": 1200
    },
    {
      "symbol": "AAPL",
      "side": "BUY",
      "shares": 10.666667,
      "price": 180,
      "notional": 1920.0
    }
  ],
  "net": 0.0,
  "totalValue": 4700
}
```

## Options

### `fractional` (default: `true`)

- `true`: Allows fractional shares (rounded to 6 decimal places)
- `false`: Rounds to whole shares

### `band` (default: `0.001`)

Tolerance threshold as a fraction of target value. Orders are only generated when the difference between current and target value exceeds `targetValue * band`.

### `minNotional` (default: `0`)

Minimum order value in dollars. Orders with notional value below this threshold are filtered out.

## Architecture

Minimalist design with clear separation of concerns:

### Backend

- **helpers/**: Pure functions (weights, orders)
- **services/**: Business logic (plan function)
- **dto/**: Types and validation schemas
- **api/**: Next.js route handler

### Frontend (Tailwind CSS)

- **components/rebalance/**: UI components with single responsibility
  - `PositionList.tsx`: Manages position inputs
  - `AllocationList.tsx`: Manages allocation inputs with validation
  - `PriceList.tsx`: Manages price inputs
  - `OptionsForm.tsx`: Manages rebalance options
  - `ResultDisplay.tsx`: Smart display with order visualization
  - `RebalanceForm.tsx`: Orchestrates form state and API calls
  - `types.ts`: Shared component types
- **components/ui/**: Reusable UI components
  - `Tooltip.tsx`: Contextual help tooltips
  - `InfoIcon.tsx`: Information icon for tooltips

### UX Features

- 📊 Real-time validation of allocation weights (must sum to 1.0)
- 💡 Contextual tooltips on every section explaining their purpose
- 🎨 Visual feedback with color-coded states (green/yellow/red)
- 📈 Enhanced result display with order cards and summary metrics
- ⚡ Loading states and smooth transitions
- 🎯 Sticky result panel for easy reference while editing

## Key Features

- Symbols not present in allocation are automatically liquidated (target = 0)
- Net cash flow is balanced to ≈ $0.00 (within $0.01)
- Allocation weights must sum to 1 ± 1e-8
- Orders are sorted: SELL first, then BUY; within each side, largest notional first
- Comprehensive unit and e2e tests with Vitest

## Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run validate` - Run type-check + tests
