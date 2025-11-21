import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';

// --- Mock Data Structure ---
const MOCK_PORTFOLIO_DATA = {
  totalValue: 125000.55,
  dailyChange: 1250.22,
  dailyChangePercent: 1.01,
  holdings: [
    { ticker: 'GOOG', name: 'Alphabet Inc.', shares: 150, price: 175.50, allocation: 40, performance: [120, 130, 160, 175, 175.50] },
    { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 80, price: 420.00, allocation: 26, performance: [350, 365, 390, 410, 420.00] },
    { ticker: 'AMZN', name: 'Amazon Inc.', shares: 500, price: 18.01, allocation: 14, performance: [15, 16, 17, 18.5, 18.01] },
    { ticker: 'AAPL', name: 'Apple Inc.', shares: 200, price: 185.90, allocation: 20, performance: [190, 188, 186, 185, 185.90] },
  ],
  timeline: [
    { name: 'Jan', value: 95000 },
    { name: 'Feb', value: 98000 },
    { name: 'Mar', value: 105000 },
    { name: 'Apr', value: 110000 },
    { name: 'May', value: 115000 },
    { name: 'Jun', value: 125000.55 },
  ]
};

// --- Component: Card Metrics ---
const MetricCard = ({ icon: Icon, title, value, changePercent, isPositive }) => (
  <div className="bg-gray-700 p-4 rounded-xl shadow-lg flex flex-col justify-between h-full">
    <div className="flex items-center space-x-3 mb-2">
      <Icon className="text-blue-400" size={24} />
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
    </div>
    <div className="text-3xl font-bold text-white mb-1">
      {typeof value === 'number' ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
    </div>
    {changePercent !== undefined && (
      <div className={`text-sm font-semibold flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        <TrendingUp size={16} className={`mr-1 transform ${isPositive ? 'rotate-0' : 'rotate-180'} transition-transform duration-300`} />
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}% Today
      </div>
    )}
  </div>
);

// --- Component: Holdings Table ---
const HoldingsTable = ({ holdings }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full overflow-x-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Current Holdings</h2>
      <table className="min-w-full text-left text-sm text-gray-300">
        <thead className="text-xs uppercase bg-gray-700 text-gray-200 rounded-lg">
          <tr>
            <th scope="col" className="px-3 py-3 rounded-l-lg">Ticker</th>
            <th scope="col" className="px-3 py-3">Shares</th>
            <th scope="col" className="px-3 py-3 text-right">Last Price</th>
            <th scope="col" className="px-3 py-3 text-right">Value</th>
            <th scope="col" className="px-3 py-3 text-right rounded-r-lg">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, index) => {
            const currentTotal = h.shares * h.price;
            return (
              <tr key={h.ticker} className={`border-b border-gray-700 hover:bg-gray-600 transition duration-150 ${index % 2 === 0 ? 'bg-gray-750' : ''}`}>
                <th scope="row" className="px-3 py-3 font-medium text-white">
                  {h.ticker}
                  <div className="text-xs text-gray-400 font-normal">{h.name}</div>
                </th>
                <td className="px-3 py-3">{h.shares}</td>
                <td className="px-3 py-3 text-right">${h.price.toFixed(2)}</td>
                <td className="px-3 py-3 text-right">${currentTotal.toFixed(2)}</td>
                <td className="px-3 py-3 text-right font-bold">{h.allocation}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Component: Portfolio Chart ---
const PortfolioChart = ({ data }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-96 w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Portfolio Value Trend (6 Months)</h2>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis 
            stroke="#9ca3af"
            tickFormatter={(value) => `$${value / 1000}k`}
            domain={['dataMin - 5000', 'dataMax + 5000']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px' }}
            formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
            labelStyle={{ color: '#fff' }}
          />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [data, setData] = useState(MOCK_PORTFOLIO_DATA);
  const [loading, setLoading] = useState(false);
  const isPositive = data.dailyChangePercent >= 0;

  // Simulate data refresh for UI effect
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      // Simulate slight volatility for a dynamic feel
      const newChange = (Math.random() * 2 - 1) * 2000; // +/- $2000
      const newTotal = data.totalValue + newChange;
      const newPercent = (newChange / data.totalValue) * 100;

      setData(prev => ({
        ...prev,
        totalValue: newTotal,
        dailyChange: newChange,
        dailyChangePercent: newPercent,
      }));
      setLoading(false);
    }, 1000); // 1 second delay
  }, [data.totalValue]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-extrabold text-white">Portfolio Overview</h1>
        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <span className="text-gray-400 flex items-center"><Calendar size={18} className="mr-1" /> June 2024</span>
        </div>
      </header>

      {/* Grid Layout for Metrics (Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          icon={DollarSign}
          title="Total Portfolio Value"
          value={data.totalValue}
        />
        <MetricCard 
          icon={TrendingUp}
          title="Daily Change"
          value={Math.abs(data.dailyChange)}
          changePercent={Math.abs(data.dailyChangePercent)}
          isPositive={isPositive}
        />
        <MetricCard 
          icon={Zap}
          title="Volatility Index"
          value="Medium"
          changePercent={0.0}
          isPositive={true}
        />
      </div>

      {/* Main Content Area (Chart and Holdings Table) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart (Takes up full width on mobile, 2/3 on desktop) */}
        <div className="lg:w-2/3">
          <PortfolioChart data={data.timeline} />
        </div>

        {/* Holdings Table (Takes up full width on mobile, 1/3 on desktop) */}
        <div className="lg:w-1/3">
          <HoldingsTable holdings={data.holdings} />
        </div>
      </div>
      
      <footer className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>Data is mocked for demonstration purposes. Developed with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;

