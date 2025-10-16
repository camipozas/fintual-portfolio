'use client';

import { useState } from 'react';
import type { PositionInput, AllocationInput, PriceInput, RebalanceOptions } from './types';
import { PositionList } from './PositionList';
import { AllocationList } from './AllocationList';
import { PriceList } from './PriceList';
import { OptionsForm } from './OptionsForm';
import { ResultDisplay } from './ResultDisplay';

const initialPositions: PositionInput[] = [
  { symbol: 'META', shares: '10' },
  { symbol: 'AAPL', shares: '5' },
  { symbol: 'NFLX', shares: '2' },
];

const initialAllocations: AllocationInput[] = [
  { symbol: 'META', weight: '0.4' },
  { symbol: 'AAPL', weight: '0.6' },
];

const initialPrices: PriceInput[] = [
  { symbol: 'META', price: '350' },
  { symbol: 'AAPL', price: '180' },
  { symbol: 'NFLX', price: '600' },
];

const initialOptions: RebalanceOptions = {
  fractional: true,
  band: '0.001',
  minNotional: '1',
};

export function RebalanceForm() {
  const [positions, setPositions] = useState(initialPositions);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [prices, setPrices] = useState(initialPrices);
  const [options, setOptions] = useState(initialOptions);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult('');

    try {
      const requestBody = {
        positions: positions
          .filter(p => p.symbol && p.shares)
          .map(p => ({ symbol: p.symbol, shares: parseFloat(p.shares) })),
        allocation: Object.fromEntries(
          allocations
            .filter(a => a.symbol && a.weight)
            .map(a => [a.symbol, parseFloat(a.weight)])
        ),
        prices: Object.fromEntries(
          prices
            .filter(p => p.symbol && p.price)
            .map(p => [p.symbol, parseFloat(p.price)])
        ),
        options: {
          fractional: options.fractional,
          band: parseFloat(options.band),
          minNotional: parseFloat(options.minNotional),
        },
      };

      const res = await fetch('/api/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <PositionList positions={positions} onChange={setPositions} />
        <AllocationList allocations={allocations} onChange={setAllocations} />
        <PriceList prices={prices} onChange={setPrices} />
        <OptionsForm options={options} onChange={setOptions} />
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating Rebalance...
            </span>
          ) : (
            'Calculate Rebalance Plan'
          )}
        </button>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <ResultDisplay result={result} loading={loading} />
      </div>
    </div>
  );
}
