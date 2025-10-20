import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import toast from 'react-hot-toast';
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword, error, isLoading, message } = useAuthStore();
	const { token } = useParams();
	const navigate = useNavigate();

	const isPasswordStrong = password.length >= 6 && 
                            /[A-Z]/.test(password) && 
                            /[a-z]/.test(password) && 
                            /\d/.test(password) && 
                            /[^A-Za-z0-9]/.test(password); // Check if password meets strength criteria

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isPasswordStrong) {
			toast.error("Password must meet the strength criteria."); // Notify user if criteria not met
			return;
		}

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		try {
			await resetPassword(token, password);
			toast.success("Password reset successfully, redirecting to login page...");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error) {
			console.error(error);
			toast.error(error.message || "Error resetting password");
		}
	};

	return (
		<div className="flex h-screen bg-gradient-to-br from-gray-500 via-gray-800 to-gray-700 bg-[length:300%_300%] animate-gradientShift">
			{/* Left side */}
			<div className="hidden md:flex w-1/2 p-12 flex-col justify-between text-white">
				<div>
					<div className="text-4xl mb-4">*</div>
					<h1 className="text-5xl font-bold mb-4">Reset Your Password</h1>
					<p className="text-xl">
						Please enter your new password below to reset it.
					</p>
				</div>
				<div className="text-sm">© 2024 Company Name. All rights reserved.</div>
			</div>

			{/* Right side */}
			<div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">
				<motion.div
					className="max-w-md mx-auto w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h3 className="text-xl font-semibold mb-4">Set New Password</h3>

					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							icon={Lock}
							type='password'
							placeholder='New Password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded"
							required
						/>

						<Input
							icon={Lock}
							type='password'
							placeholder='Confirm New Password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded"
							required
						/>

						{/* Add PasswordStrengthMeter here */}
						<PasswordStrengthMeter password={password} />

						{error && <p className='text-red-500 font-semibold'>{error}</p>}
						{message && <p className='text-green-500 font-semibold'>{message}</p>}

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							disabled={!isPasswordStrong || isLoading} // Disable if password is not strong or if loading
							className={`w-full p-2 rounded ${!isPasswordStrong ? "bg-gray-400" : "bg-black text-white"}`} // Change button color based on password strength
						>
							{isLoading ? "Resetting..." : "Set New Password"}
						</motion.button>
					</form>
				</motion.div>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
