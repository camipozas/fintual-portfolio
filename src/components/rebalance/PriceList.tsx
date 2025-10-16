import type { PriceInput } from './types';
import { Tooltip } from '../ui/Tooltip';
import { InfoIcon } from '../ui/InfoIcon';

interface Props {
  prices: PriceInput[];
  onChange: (prices: PriceInput[]) => void;
}

export function PriceList({ prices, onChange }: Props) {
  const addPrice = () => {
    onChange([...prices, { symbol: '', price: '' }]);
  };

  const removePrice = (idx: number) => {
    onChange(prices.filter((_, i) => i !== idx));
  };

  const updatePrice = (idx: number, field: keyof PriceInput, value: string) => {
    const updated = [...prices];
    updated[idx] = { ...updated[idx]!, [field]: field === 'symbol' ? value.toUpperCase() : value };
    onChange(updated);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Market Prices</h2>
          <Tooltip content="Current market price per share for each stock. Used to calculate the total portfolio value and rebalancing orders.">
            <InfoIcon />
          </Tooltip>
        </div>
        <button
          onClick={addPrice}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition"
        >
          + Add Price
        </button>
      </div>
      <div className="space-y-2">
        {prices.map((priceItem, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="AAPL"
                value={priceItem.symbol}
                onChange={(e) => updatePrice(idx, 'symbol', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="150.00"
                step="0.01"
                value={priceItem.price}
                onChange={(e) => updatePrice(idx, 'price', e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => removePrice(idx)}
              className="w-9 h-9 text-red-600 border border-red-300 rounded-md hover:bg-red-50 flex items-center justify-center text-xl transition"
              aria-label="Remove price"
            >
              ×
            </button>
          </div>
        ))}
        {prices.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No prices added yet</p>
        )}
      </div>
    </section>
  );
}
