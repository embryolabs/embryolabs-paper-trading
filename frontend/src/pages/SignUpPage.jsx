import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter"; // Import your PasswordStrengthMeter
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!name || !email || !password) {
      toast.error("All fields are required.", { position: "top-right", autoClose: 3000 }); // Show toast for 3 seconds
      return;
    }

    // Check password strength
    const strength = getStrength(password);
    if (strength < 4) {
      toast.error("Password does not meet the strength criteria.", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      const result = await signup(email, password, name);
      
      // Navigate only if signup is successful
      if (result.success) {
        navigate("/verify-email");
      } else {
        toast.error("Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up. Please try again.");
    }
  };

  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-500 via-gray-800 to-gray-700 bg-[length:300%_300%] animate-gradientShift">
      {/* Left side */}
      <div className="w-1/2 p-12 flex flex-col justify-between text-white">
        <div>
          <div className="text-4xl mb-4">*</div>
          <h1 className="text-5xl font-bold mb-4">Join Us! 👋</h1>
          <p className="text-xl">Create your account and start paper trading right now.</p>
        </div>
        <div className="text-sm">© 2024 EmbryoLabs. All rights reserved.</div>
      </div>

      {/* Right side */}
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <motion.div
          className="max-w-md mx-auto w-full bg-white p-8 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">Create Account</h3>

          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              icon={User}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <PasswordStrengthMeter password={password} />
            {error && <p className="text-red-500 font-semibold">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !name || !email || !password || getStrength(password) < 4}
              className={`w-full p-2 rounded ${isLoading || !name || !email || !password || getStrength(password) < 4 ? 'bg-gray-400' : 'bg-black text-white'}`}
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Sign Up"}
            </motion.button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;



/*
import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter"; // Import your PasswordStrengthMeter
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!name || !email || !password) {
      toast.error("All fields are required.", { position: "top-right", autoClose: 3000 }); // Show toast for 3 seconds
      return;
    }

    // Check password strength
    const strength = getStrength(password);
    if (strength < 4) {
      toast.error("Password does not meet the strength criteria.", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      const result = await signup(email, password, name);
      
      // Navigate only if signup is successful
      if (result.success) {
        navigate("/verify-email");
      } else {
        toast.error("Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up. Please try again.");
    }
  };

  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  return (
    <div className="flex h-screen bg-blue-600">
      {/* Left side */

      /*
      <div className="w-1/2 p-12 flex flex-col justify-between text-white">
        <div>
          <div className="text-4xl mb-4">*</div>
          <h1 className="text-5xl font-bold mb-4">Join Us! 👋</h1>
          <p className="text-xl">Create your account and start paper trading right now.</p>
        </div>
        <div className="text-sm">© 2024 EmbryoLabs. All rights reserved.</div>
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
          <h3 className="text-xl font-semibold mb-4">Create Account</h3>

          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              icon={User}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <PasswordStrengthMeter password={password} />
            {error && <p className="text-red-500 font-semibold">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !name || !email || !password || getStrength(password) < 4}
              className={`w-full p-2 rounded ${isLoading || !name || !email || !password || getStrength(password) < 4 ? 'bg-gray-400' : 'bg-black text-white'}`}
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Sign Up"}
            </motion.button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;

*/
