import type { PositionInput } from './types';
import { Tooltip } from '../ui/Tooltip';
import { InfoIcon } from '../ui/InfoIcon';

interface Props {
  positions: PositionInput[];
  onChange: (positions: PositionInput[]) => void;
}

export function PositionList({ positions, onChange }: Props) {
  const addPosition = () => {
    onChange([...positions, { symbol: '', shares: '' }]);
  };

  const removePosition = (idx: number) => {
    onChange(positions.filter((_, i) => i !== idx));
  };

  const updatePosition = (idx: number, field: keyof PositionInput, value: string) => {
    const updated = [...positions];
    updated[idx] = { ...updated[idx]!, [field]: field === 'symbol' ? value.toUpperCase() : value };
    onChange(updated);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Current Positions</h2>
          <Tooltip content="Your current stock holdings. Enter the ticker symbol and number of shares you own.">
            <InfoIcon />
          </Tooltip>
        </div>
        <button
          onClick={addPosition}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition"
        >
          + Add Position
        </button>
      </div>
      <div className="space-y-2">
        {positions.map((pos, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="AAPL"
                value={pos.symbol}
                onChange={(e) => updatePosition(idx, 'symbol', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="100"
                step="0.000001"
                value={pos.shares}
                onChange={(e) => updatePosition(idx, 'shares', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => removePosition(idx)}
              className="w-9 h-9 text-red-600 border border-red-300 rounded-md hover:bg-red-50 flex items-center justify-center text-xl transition"
              aria-label="Remove position"
            >
              ×
            </button>
          </div>
        ))}
        {positions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No positions added yet</p>
        )}
      </div>
    </section>
  );
}
