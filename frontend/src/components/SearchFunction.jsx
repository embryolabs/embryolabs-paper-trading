import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Spinner from 'react-bootstrap/Spinner';

const StockSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const API_KEY = import.meta.env.VITE_REACT_APP_API_KEY;

  useEffect(() => {
    const fetchSuggestions = async (term) => {
      setIsFetching(true);
      if (term.length === 0) {
        setSuggestions([]);
        setIsFetching(false);
        return;
      }

      try {
        const response = await fetch(`https://finnhub.io/api/v1/search?q=${term}&token=${API_KEY}`);
        const data = await response.json();

        const filteredSuggestions = data.result
          ? data.result
              .map(match => ({
                symbol: match.symbol,
                name: match.description,
              }))
              .slice(0, 5)
          : [];

        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsFetching(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectStock = (symbol) => {
    navigate(`/stocks/${symbol}`);
    setIsExpanded(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className={`relative transition-all duration-300 ${isExpanded ? 'md:w-1/3 mx-auto' : 'w-full'}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`p-2 rounded bg-gray-800 text-white placeholder-gray-400 transition-all duration-300 ${isExpanded ? 'md:w-full' : 'w-full'}`}
          placeholder="Search for a stock..."
          onFocus={() => setIsExpanded(true)} // Expand on focus
        />
        <div className="absolute top-2 right-2">
          <Search size={20} className="text-white" />
        </div>

        {isExpanded && (
          <div className="absolute left-0 mt-2 w-full bg-gray-700 text-white rounded shadow-lg p-4 z-50">
            {isFetching ? (
              <div className="flex justify-center items-center">
                <Spinner animation="border" role="status" className="text-white">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="cursor-pointer hover:bg-gray-600 p-2 rounded"
                    onClick={() => handleSelectStock(stock.symbol)}
                  >
                    <span className="font-bold">{stock.symbol}</span> - {stock.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center">No stocks found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSearch;
