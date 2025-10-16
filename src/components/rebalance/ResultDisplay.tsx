interface Props {
  result: string;
  loading: boolean;
}

export function ResultDisplay({ result, loading }: Props) {
  let parsedResult = null;
  let isError = false;

  try {
    if (result && !result.startsWith('Error:')) {
      parsedResult = JSON.parse(result);
    } else if (result.startsWith('Error:')) {
      isError = true;
    }
  } catch {
    // Keep as string
  }

  return (
    <section className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Rebalancing Plan</h2>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Calculating...
          </div>
        )}
      </div>

      {!result && !loading && (
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Fill out the form and click Calculate to see your rebalancing plan</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
              <p className="text-sm text-red-700">{result}</p>
            </div>
          </div>
        </div>
      )}

      {parsedResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-blue-900">
                ${parsedResult.totalValue?.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-600 font-medium mb-1">Net Cash Flow</p>
              <p className="text-2xl font-bold text-green-900">
                ${parsedResult.net?.toFixed(2)}
              </p>
            </div>
          </div>

          {parsedResult.orders && parsedResult.orders.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  Orders ({parsedResult.orders.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {parsedResult.orders.map((order: any, idx: number) => (
                  <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded ${
                          order.side === 'BUY' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.side}
                        </span>
                        <span className="font-mono font-semibold text-gray-900">{order.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${order.notional.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.shares.toLocaleString()} × ${order.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-600">
                ✓ Portfolio is already balanced. No orders needed.
              </p>
            </div>
          )}
        </div>
      )}

      {result && !parsedResult && !isError && (
        <pre className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-sm font-mono overflow-auto whitespace-pre-wrap break-words">
          {result}
        </pre>
      )}
    </section>
  );
}
