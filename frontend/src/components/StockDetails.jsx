import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import StockSearch from '../components/SearchFunction.jsx';
import { Spinner } from 'react-bootstrap';
import dynamic from 'next/dynamic';
// Import ApexCharts with dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const StockDetails = () => {
  const { symbol } = useParams();
  const API_KEY = import.meta.env.VITE_REACT_APP_API_KEY;

  const [stockData, setStockData] = useState([]);
  const [error, setError] = useState(null);
  const { invest, sell, user } = useAuthStore();
  const [amountInvested, setAmountInvested] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [latestPrice, setLatestPrice] = useState(null);
  const [marketStatus, setMarketStatus] = useState('');
  const [chartColor, setChartColor] = useState('#26C281');

  const socket = useRef(null);
  const isUsingWebSocket = useRef(false);
  const pollingInterval = useRef(null);

  // Function to fetch market status
  const fetchMarketStatus = async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch market status');
      }
      const data = await response.json();
      setMarketStatus(
        data.isOpen
        ? 'open'
        : data.session === 'pre-market'
        ? 'pre-market'
        : data.session === 'post-market'
        ? 'post-market'
        : 'closed'
      );
    } catch (error) {
      console.error('Error fetching market status:', error);
      setMarketStatus('unknown');
    }
  };

  // Function to fetch stock data via polling
  const fetchStockData = async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.c) {
        updateStockData(data.c);
        setError(null);
      } else {
        throw new Error('Unable to fetch stock data.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error fetching stock data');
      toast.error('Error fetching stock data');
    } finally {
      setLoading(false);
    }
  };

  // Function to update stock data
  const updateStockData = (newPrice) => {
    const newPoint = {
      x: new Date().getTime(), // Convert to timestamp for ApexCharts
      y: newPrice,
    };
    setStockData((prevData) => {
      const updatedData = [...prevData, newPoint];
      // Limit to last 1000 points to optimize performance
      if (updatedData.length > 1000) {
        updatedData.shift();
      }
      // Update chart color based on price movement
      if (updatedData.length > 1) {
        const firstPrice = updatedData[0].y;
        const currentPrice = newPoint.y;
        setChartColor(currentPrice >= firstPrice ? '#26C281' : '#FF5252');
      }
      
      return updatedData;
    });
    setLatestPrice(newPrice);
  };

  // Add ApexCharts configuration
  const chartOptions = {
    chart: {
      type: 'area',
      height: 380,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      background: 'transparent'
    },
    grid: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    colors: [chartColor],
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        style: {
          colors: '#888',
          fontSize: '10px'
        },
        datetimeFormatter: {
          hour: 'HH:mm',
          minute: 'HH:mm'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: '#888',
          fontSize: '10px'
        },
        formatter: (value) => `$${value.toFixed(2)}`
      }
    },
    tooltip: {
      x: {
        format: 'HH:mm:ss'
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      },
      theme: 'dark'
    }
  };

  // Function to start polling
  const startPolling = () => {
    fetchStockData();
    pollingInterval.current = setInterval(fetchStockData, 60000); // Poll every 60 seconds
  };

  // Function to stop polling
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Function to set up WebSocket
  const setupWebSocket = () => {
    setStockData([]);

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    socket.current = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

    socket.current.onopen = () => {
      console.log('WebSocket Connected');
      socket.current.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
      isUsingWebSocket.current = true;
      stopPolling();
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade' && data.data && data.data.length > 0) {
        updateStockData(data.data[0].p);
      }
    };

    socket.current.onclose = () => {
      console.log('WebSocket Disconnected');
      isUsingWebSocket.current = false;
      startPolling();
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      isUsingWebSocket.current = false;
      startPolling();
    };
  };

  // Initialize data fetching and WebSocket
  useEffect(() => {
    const initializeDataFetching = async () => {
      await fetchMarketStatus();
      await fetchStockData();
      setupWebSocket();
    };

    initializeDataFetching();

    const marketStatusInterval = setInterval(fetchMarketStatus, 60000); // Poll market status every 60 seconds

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      stopPolling();
      clearInterval(marketStatusInterval);
    };
  }, [symbol]);

  // Handle investment form submission
  const handleInvestment = async (e) => {
    e.preventDefault();
    const investmentAmount = parseFloat(amountInvested);
    if (investmentAmount < 1) {
      toast.error('Please enter a valid investment amount of at least $1.');
      return;
    }
    const stockPrice = latestPrice;
    const sharesPurchased = (investmentAmount / stockPrice).toFixed(3);

    if (sharesPurchased > 0) {
      const result = await invest({
        stockSymbol: symbol,
        amountInvested: investmentAmount,
        quantity: sharesPurchased,
      });
      if (result.success) {
        toast.success('Investment successful!');
        setAmountInvested('');
      } else {
        toast.error(result.error);
      }
    } else {
      toast.error('Please enter a valid investment amount.');
    }
  };

  // Handle sell form submission
  const handleSell = async (e, sellAll = false) => {
    e.preventDefault();

    let quantityToSell = parseFloat(sellQuantity);

    if (sellAll) {
      const stockInvestment = user.investments.find(
        (inv) => inv.stockSymbol === symbol
      );
      const totalQuantity = stockInvestment
        ? parseFloat(stockInvestment.quantity)
        : 0;

      if (totalQuantity <= 0) {
        toast.error("You don't have any stock to sell.");
        return;
      }

      quantityToSell = totalQuantity;
    }

    if (quantityToSell <= 0) {
      toast.error('Please enter a valid quantity to sell.');
      return;
    }

    const result = await sell({
      stockSymbol: symbol,
      quantity: quantityToSell,
    });
    if (result.success) {
      toast.success('Shares sold successfully!');
      setSellQuantity('');
    } else {
      toast.error(result.error);
    }
  };

  


  return (
    <div className="flex-col items-center justify-start min-h-screen">
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <StockSearch className="search" />
          <Sidebar />
          <Header />
          <ToastContainer />

          <h1 className="text-3xl font-bold text-gray-800 mt-[0.1rem]">{symbol}</h1>

          {latestPrice !== null && (
            <p className="text-xl" style={{ color: chartColor }}>
              ${latestPrice.toFixed(2)}
              {marketStatus === 'open' ? (
                isUsingWebSocket.current ? (
                  <span className="text-green-500 ml-2">(Real-time)</span>
                ) : (
                  <span className="text-yellow-500 ml-2">(Periodic updates)</span>
                )
              ) : marketStatus === 'pre-market' ? (
                <span className="text-blue-500 ml-2">(Pre-market)</span>
              ) : marketStatus === 'post-market' ? (
                <span className="text-orange-500 ml-2">(Post-market)</span>
              ) : (
                <span className="text-red-500 ml-2">(Market Closed)</span>
              )}
            </p>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {!error && stockData.length > 0 && (
            <div className="w-full max-w-3xl h-96">
              <Chart
                options={chartOptions}
                series={[{ name: symbol, data: stockData }]}
                type="area"
                height={380}
              />
            </div>
          )}

          {/* Keep your existing Investment and Sell forms */}
          <form onSubmit={handleInvestment} className="w-full max-w-md flex flex-col gap-2">
            <input
              type="number"
              placeholder="Amount to Invest"
              value={amountInvested}
              onChange={(e) => setAmountInvested(e.target.value)}
              step="0.01"
              min="1"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Invest
            </button>
          </form>

          <form onSubmit={handleSell} className="w-full max-w-md flex flex-col gap-2">
            <input
              type="number"
              placeholder="Quantity to Sell"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              step="0.001"
              min="0.001"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
              >
                Sell
              </button>
              <button
                type="button"
                onClick={(e) => handleSell(e, true)}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
              >
                Sell All
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StockDetails;
