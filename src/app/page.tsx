import { RebalanceForm } from '@/components/rebalance/RebalanceForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Portfolio Rebalance Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate optimal buy/sell orders to achieve your target portfolio allocation
          </p>
        </div>
        <RebalanceForm />
      </div>
    </main>
  );
}
