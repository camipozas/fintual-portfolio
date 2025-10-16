import type { RebalanceOptions } from './types';
import { Tooltip } from '../ui/Tooltip';
import { InfoIcon } from '../ui/InfoIcon';

interface Props {
  options: RebalanceOptions;
  onChange: (options: RebalanceOptions) => void;
}

export function OptionsForm({ options, onChange }: Props) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Rebalance Options</h2>
        <Tooltip content="Advanced settings to customize how the rebalancing calculation is performed.">
          <InfoIcon />
        </Tooltip>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={options.fractional}
            onChange={(e) => onChange({ ...options, fractional: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700">Fractional Shares</span>
              <Tooltip content="Allow fractional shares (e.g., 10.5 shares). If disabled, only whole numbers are used.">
                <InfoIcon />
              </Tooltip>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Precision: 6 decimals</p>
          </div>
        </label>

        <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-md">
          <div className="flex items-center gap-1">
            <label className="text-sm font-medium text-gray-700">Band (Tolerance)</label>
            <Tooltip content="Relative tolerance threshold. Orders only generated when difference exceeds target × band (e.g., 0.001 = 0.1% tolerance).">
              <InfoIcon />
            </Tooltip>
          </div>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={options.band}
            onChange={(e) => onChange({ ...options, band: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">Default: 0.001</p>
        </div>

        <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-md">
          <div className="flex items-center gap-1">
            <label className="text-sm font-medium text-gray-700">Min. Notional</label>
            <Tooltip content="Minimum order value in dollars. Orders below this amount will be filtered out to avoid tiny trades.">
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              min="0"
              value={options.minNotional}
              onChange={(e) => onChange({ ...options, minNotional: e.target.value })}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500">Default: $0</p>
        </div>
      </div>
    </section>
  );
}
