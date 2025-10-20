import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion'

const API_KEY = import.meta.env.VITE_REACT_APP_API_KEY;

export default function Portfolio() {
  const { user } = useAuthStore();
  const [portfolioData, setPortfolioData] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPortfolioValues();
    }
  }, [user]);

  const fetchCurrentPrice = async (symbol) => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );
      const data = await response.json();

      if (data.c) {
        return parseFloat(data.c);
      } else {
        console.error("Unexpected API response structure:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching stock price:", error);
      return null;
    }
  };

  const fetchPortfolioValues = async () => {
    const data = [];
    let totalValue = user.paperTradingBalance;
    const investmentData = {};

    for (const investment of user.investments) {
      const currentPrice = await fetchCurrentPrice(investment.stockSymbol);
      if (currentPrice) {
        const investmentValue = currentPrice * investment.quantity;
        totalValue += investmentValue;
        data.push({
          name: investment.stockSymbol,
          value: totalValue,
          date: new Date(investment.date).toLocaleDateString(),
        });
            // Store investment data for pie chart
        investmentData[investment.stockSymbol] = {
            quantity: investment.quantity,
            amountInvested: investment.amountInvested,
        };

      }
    }
    const pieChartData = Object.keys(investmentData).map((key) => ({
      name: key,
      value: investmentData[key].quantity,
      amountInvested: investmentData[key].amountInvested,
  }));


    for (const transaction of user.transactions) {
      const transactionValue = transaction.type === 'buy' 
        ? -transaction.amount
        : transaction.amount;

      totalValue += transactionValue;

      data.push({
        name: transaction.stockSymbol,
        value: totalValue,
        date: new Date(transaction.date).toLocaleDateString(),
      });
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    setPortfolioData(data);
    setPieChartData(pieChartData);
  };

  const [pieChartData, setPieChartData] = useState([]);


  const formattedBalance = user?.paperTradingBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const COLORS = [
    '#3B82F6', // Blue
    '#FBBF24', // Amber
    '#10B981', // Emerald
    '#F43F5E', // Rose
    '#4F46E5', // Indigo
    '#A855F7', // Violet
    '#F472B6', // Pink
    '#EF4444', // Red
    '#6EE7B7', // Teal
    '#9333EA', // Purple
  ];

  return (
    <div className="ml-5">
      <div className="mt-4 p-6 ml-60">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg p-4 mb-6 shadow-md max-w-3xl border border-gray-700"
        >
          <p className="text-lg font-semibold text-gray-400">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-gray-300">${formattedBalance}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
          {/* Line Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-80 w-full p-4 rounded-lg shadow-md border border-gray-700"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
                <XAxis 
                  dataKey="date" 
                  interval={5}
                  tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#E5E7EB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4F46E5" 
                  strokeWidth={2} 
                  dot={false}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 rounded-lg shadow-md border border-gray-700"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ 
                      backgroundColor: '#F4F4F5',
                      borderRadius: '0.5rem',
                      color: '#E5E7EB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 gap-3 mt-6"
            >
              {pieChartData.map((item, index) => (
                <motion.div 
                  key={item.name}
                  className="flex items-center bg-gray-100 p-2 rounded-md "
                >
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-zinc-500">
                    {item.name} ({item.value}%)
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-2xl font-bold text-blue-400 text-center mt-6"
            >
              Total Invested: ${pieChartData.reduce((acc, item) => acc + item.amountInvested, 0).toFixed(2)}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
