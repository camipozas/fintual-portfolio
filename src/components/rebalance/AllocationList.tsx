import type { AllocationInput } from './types';
import { Tooltip } from '../ui/Tooltip';
import { InfoIcon } from '../ui/InfoIcon';

interface Props {
  allocations: AllocationInput[];
  onChange: (allocations: AllocationInput[]) => void;
}

export function AllocationList({ allocations, onChange }: Props) {
  const addAllocation = () => {
    onChange([...allocations, { symbol: '', weight: '' }]);
  };

  const removeAllocation = (idx: number) => {
    onChange(allocations.filter((_, i) => i !== idx));
  };

  const updateAllocation = (idx: number, field: keyof AllocationInput, value: string) => {
    const updated = [...allocations];
    updated[idx] = { ...updated[idx]!, [field]: field === 'symbol' ? value.toUpperCase() : value };
    onChange(updated);
  };

  const totalWeight = allocations.reduce((sum, a) => {
    const weight = parseFloat(a.weight);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);

  const isValidTotal = Math.abs(totalWeight - 1) < 0.001;

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Target Allocation</h2>
          <Tooltip content="Your desired portfolio distribution. Weights must sum to 1.0 (e.g., 0.4 for 40%, 0.6 for 60%). Stocks not listed here will be sold.">
            <InfoIcon />
          </Tooltip>
        </div>
        <button
          onClick={addAllocation}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition"
        >
          + Add Target
        </button>
      </div>
      <div className="space-y-2">
        {allocations.map((alloc, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="AAPL"
                value={alloc.symbol}
                onChange={(e) => updateAllocation(idx, 'symbol', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="0.5"
                step="0.01"
                min="0"
                max="1"
                value={alloc.weight}
                onChange={(e) => updateAllocation(idx, 'weight', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => removeAllocation(idx)}
              className="w-9 h-9 text-red-600 border border-red-300 rounded-md hover:bg-red-50 flex items-center justify-center text-xl transition"
              aria-label="Remove allocation"
            >
              ×
            </button>
          </div>
        ))}
        {allocations.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No allocations defined yet</p>
        )}
      </div>
      {allocations.length > 0 && (
        <div
          className={`flex items-center justify-between px-4 py-2 rounded-md text-sm ${
            isValidTotal
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}
        >
          <span className="font-medium">Total Weight:</span>
          <span className="font-semibold">{totalWeight.toFixed(3)}</span>
          {!isValidTotal && <span className="text-xs">⚠ Must equal 1.0</span>}
        </div>
      )}
    </section>
  );
}
