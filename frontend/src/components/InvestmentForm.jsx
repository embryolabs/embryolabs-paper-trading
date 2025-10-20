import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const InvestmentForm = () => {
	const [stockSymbol, setStockSymbol] = useState("");
	const [amountInvested, setAmountInvested] = useState(0);
	const [quantity, setQuantity] = useState(0);
	const { invest } = useAuthStore(); // Assuming you have an invest function in your store

	const handleSubmit = async (e) => {
		e.preventDefault();
		const result = await invest({ stockSymbol, amountInvested, quantity });
		if (result.success) {
			alert("Investment successful!");
		} else {
			alert(result.error);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='investment-form'
		>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Stock Symbol"
					value={stockSymbol}
					onChange={(e) => setStockSymbol(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Amount to Invest"
					value={amountInvested}
					onChange={(e) => setAmountInvested(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Quantity"
					value={quantity}
					onChange={(e) => setQuantity(e.target.value)}
				/>
				<button type="submit">Invest</button>
			</form>
		</motion.div>
	);
};

export default InvestmentForm;