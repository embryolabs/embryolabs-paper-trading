import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState(null);
	

	const { login, isLoading, error, handleGoogleLogin: googleLogin } = useAuthStore();
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		const result = await login(email, password);
		console.log(result); // Check what is returned

		if (result.success) {
			navigate("/"); // Redirect to the dashboard or home page
		} else {
			// Check if result.message is defined before calling includes
			if (result.message && result.message.includes("not verified")) {
				// Redirect to the email verification page
				navigate("/verify-email");
			} else {
				// Show error message
				setLoginError(result.message || "An error occurred during login."); // Fallback error message
			}
		}
	};

	const handleGoogleLogin = async () => {
		try {
			await googleLogin();
			// Only navigate if the login was successful
			// Your authStore should handle this navigation internally
			// or return a success status that you can check here
		} catch (error) {
			console.error("Google login failed:", error);
		}
	};

	const FloatingBubbles = () => (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
		  {[...Array(8)].map((_, i) => (
			<motion.div
			  key={i}
			  className="absolute rounded-full bg-gradient-to-br from-orange-200/70 to-orange-300/70"
			  style={{
				width: `${Math.random() * 300 + 100}px`,
				height: `${Math.random() * 300 + 100}px`,
				left: `${Math.random() * 100}%`,
				top: `${Math.random() * 100}%`,
			  }}
			  initial={{ scale: 0.8 }}
			  animate={{
				scale: [0.8, 1, 0.8],
				x: [0, Math.random() * 50 - 25],
				y: [0, Math.random() * 50 - 25],
			  }}
			  transition={{
				duration: 8,
				repeat: Infinity,
				repeatType: "reverse",
			  }}
			/>
		  ))}
		</div>
	  );
	  

	  return (
		<div className="min-h-screen flex flex-col md:flex-row">
		  {/* Left side - Background with gradient */}
		  <div className="md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8 md:p-16 flex flex-col justify-between">
			<div className="max-w-md">
			  <div className="text-4xl text-white mb-4">✨</div>
			  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
				Welcome back
			  </h1>
			  <p className="text-xl text-gray-300">
				Hands-on investing made simple, safe, and real.
			  </p>
			</div>
			<div className="text-sm text-gray-400">© 2025 EmbryoLabs. All rights reserved.</div>
		  </div>
	
		  {/* Right side - Login form */}
		  <div className="md:w-1/2 bg-white flex items-center justify-center p-8">
			<motion.div
			  className="w-full max-w-md"
			  initial={{ opacity: 0, y: 20 }}
			  animate={{ opacity: 1, y: 0 }}
			  transition={{ duration: 0.5 }}
			>
			  {/* Google Login Button */}
			  <motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={handleGoogleLogin}
				className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 p-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-8"
			  >
				<svg className="w-5 h-5" viewBox="0 0 24 24">
				  <path
					fill="currentColor"
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				  />
				  <path
					fill="currentColor"
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				  />
				  <path
					fill="currentColor"
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				  />
				  <path
					fill="currentColor"
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				  />
				</svg>
				Continue with Google
			  </motion.button>
	
			  <div className="relative mb-8">
				<div className="absolute inset-0 flex items-center">
				  <div className="w-full border-t border-gray-200"></div>
				</div>
				<div className="relative flex justify-center text-sm">
				  <span className="px-4 text-gray-500 bg-white">Or continue with email</span>
				</div>
			  </div>
	
			  <form onSubmit={handleLogin} className="space-y-6">
				<div className="space-y-4">
				  <Input
					icon={Mail}
					type="email"
					placeholder="Email Address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
				  />
	
				  <Input
					icon={Lock}
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
				  />
				</div>
	
				<div className="flex items-center justify-between">
				  <Link
					to="/forgot-password"
					className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
				  >
					Forgot password?
				  </Link>
				</div>
	
				{error && (
				  <p className="text-red-500 text-sm font-medium">{error}</p>
				)}
	
				<motion.button
				  whileHover={{ scale: 1.02 }}
				  whileTap={{ scale: 0.98 }}
				  type="submit"
				  disabled={isLoading}
				  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors"
				>
				  {isLoading ? (
					<Loader className="w-5 h-5 animate-spin mx-auto" />
				  ) : (
					"Sign in"
				  )}
				</motion.button>
			  </form>
	
			  <p className="mt-8 text-center text-sm text-gray-600">
				Don't have an account?{" "}
				<Link
				  to="/signup"
				  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
				>
				  Sign up
				</Link>
			  </p>
			</motion.div>
		  </div>
		</div>
	  );
	};
	
	export default LoginPage;