import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const handleStockClick = (stockSymbol) => {
        navigate(`/stocks/${stockSymbol}`);
    };

    const calculateAveragePrice = (investment) => {
        if (!user?.transactions) return null;

        // Get all transactions for this stock
        const stockTransactions = user.transactions
            .filter(t => t.stockSymbol === investment.stockSymbol)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Find the last transaction where total shares became zero
        let runningShares = 0;
        let lastZeroIndex = -1;

        for (let i = 0; i < stockTransactions.length; i++) {
            const tx = stockTransactions[i];
            runningShares += tx.type === 'buy' ? tx.quantity : -tx.quantity;
            
            if (Math.abs(runningShares) < 0.000001) {
                lastZeroIndex = i;
                runningShares = 0;
            }
        }

        // If we found a zero-point, only look at transactions after that
        const relevantTransactions = stockTransactions.slice(lastZeroIndex + 1);
        
        // Calculate current position
        const currentPosition = relevantTransactions.reduce((pos, tx) => {
            if (tx.type === 'buy') {
                return {
                    cost: pos.cost + tx.amount,
                    shares: pos.shares + tx.quantity
                };
            }
            // For sells, reduce proportionally
            const sellRatio = tx.quantity / pos.shares;
            return {
                cost: pos.cost * (1 - sellRatio),
                shares: pos.shares - tx.quantity
            };
        }, { cost: 0, shares: 0 });

        return currentPosition.shares > 0 
            ? (currentPosition.cost / currentPosition.shares).toFixed(2) 
            : null;
    };

    return (
        <div className="bg-gray-900 w-64 h-screen p-6 fixed top-25 left-0">
            <div className="text-xl font-semibold text-white mb-4">
                Your Stocks
            </div>
            <div className="space-y-4">
                {user?.investments.length > 0 ? (
                    <ul className="space-y-2">
                        {user.investments.map((investment, index) => {
                            const avgPrice = calculateAveragePrice(investment);
                            return (
                                <li
                                    className="text-sm text-gray-200 bg-gray-800 p-4 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-gray-700 hover:border-blue-500 shadow"
                                    key={index}
                                    onClick={() => handleStockClick(investment.stockSymbol)}
                                >
                                    <div className="flex flex-col space-y-1">
                                        <div>
                                            <span className="font-bold text-white">
                                                {investment.quantity}
                                            </span> shares of{' '}
                                            <span className="font-bold text-blue-400">
                                                {investment.stockSymbol}
                                            </span>
                                        </div>
                                        {avgPrice && (
                                            <div className="text-xs text-gray-400">
                                                Avg Price: $
                                                <span className="text-green-400">
                                                    {avgPrice}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center text-gray-400">
                        No stocks currently invested
                    </div>
                )}
            </div>
        </div>
    );
}
