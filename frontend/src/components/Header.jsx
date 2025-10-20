import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StockSearch from './SearchFunction'; // Ensure this import is correct

export default function Header() {
  return (
    <header className="flex items-center justify-between p-1 bg-gray-900 w-full fixed top-0 z-10">
      {/* Logo on the top-left */}
      <div className="flex items-center">
        <Link to="/" className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <img src="/embryobun2FILLEDWHITE.png" alt="Logo" className="w-12 h-auto" />
          </motion.div>
        </Link>
      </div>

      {/* Search bar initially spans full width */}
      <div className="flex-1 mx-4">
        <StockSearch />
      </div>

      {/* Profile navigation on the top-right */}
      <nav className="flex items-center m-0 space-x-4 p-2">
        <Link to="/profile" className="text-white text-sm">
          Profile
        </Link>
      </nav>
    </header>
  );
}
