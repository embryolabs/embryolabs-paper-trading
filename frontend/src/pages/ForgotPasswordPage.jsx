import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-500 via-gray-800 to-gray-700 bg-[length:300%_300%] animate-gradientShift">
      {/* Left side */}
      <div className="w-1/2 p-12 flex flex-col justify-between text-white">
        <div>
          <div className="text-4xl mb-4">*</div>
          <h1 className="text-5xl font-bold mb-4">Forgot Password?</h1>
          <p className="text-xl">
            Don't worry, it happens. Let's get you back into your account.
          </p>
        </div>
        <div className="text-sm">© 2024 Company Name. All rights reserved.</div>
      </div>

      {/* Right side */}
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <motion.div
          className="max-w-md mx-auto w-full bg-white p-8 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">Reset Your Password</h3>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-600 mb-4">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white p-2 rounded"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Send Reset Link"}
              </motion.button>
            </form>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-gray-600 mb-6">
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link to="/login" className="text-sm text-blue-600 hover:underline flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


/*
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="flex h-screen bg-blue-600">
      {/* Left side */

      /*
      <div className="w-1/2 p-12 flex flex-col justify-between text-white">
        <div>
          <div className="text-4xl mb-4">*</div>
          <h1 className="text-5xl font-bold mb-4">Forgot Password?</h1>
          <p className="text-xl">
            Don't worry, it happens. Let's get you back into your account.
          </p>
        </div>
        <div className="text-sm">© 2024 Company Name. All rights reserved.</div>
      </div>

      {/* Right side */

      /*
      <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
        <motion.div
          className="max-w-md mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">Reset Your Password</h3>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-600 mb-4">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white p-2 rounded"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Send Reset Link"}
              </motion.button>
            </form>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-gray-600 mb-6">
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link to="/login" className="text-sm text-blue-600 hover:underline flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

*/