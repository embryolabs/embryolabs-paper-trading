
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState(null); // State to hold error messages
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { isLoading, verifyEmail } = useAuthStore();

    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle pasted value or single character input
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            // Fill newCode with pasted characters
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);

            // Move focus to the next empty input or the last input
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            // Update the individual digit in the code array
            newCode[index] = value.slice(0, 1); // Ensure only one character is stored
            setCode(newCode);

            // Move focus to the next input if current one is filled
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");

        // Check if the verification code is valid (length check)
        if (verificationCode.length < 6) {
            setError("Please enter a complete 6-digit verification code.");
            return;
        }

        try {
            const response = await verifyEmail(verificationCode);
            if (response.success) {
                navigate("/");
                toast.success("Email verified successfully");
            } else {
                setError("Invalid verification code. Please try again.");
            }
        } catch (error) {
            console.log(error);
            setError("An error occurred during verification.");
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-500 via-gray-800 to-gray-700 bg-[length:300%_300%] animate-gradientShift">
            {/* Left side */}
            <div className="w-1/2 p-12 flex flex-col justify-between text-white">
                <div>
                    <div className="text-4xl mb-4">*</div>
                    <h1 className="text-5xl font-bold mb-4">Verify Your Email!</h1>
                    <p className="text-xl">
                        Enter the 6-digit code sent to your email address.
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
                    <h2 className="text-2xl font-bold mb-2">Application Name</h2>
                    <h3 className="text-xl font-semibold mb-4">Enter Verification Code</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-between">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-2xl font-bold bg-gray-200 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading || code.some((digit) => !digit)}
                            className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;


/*
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState(null); // State to hold error messages
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { isLoading, verifyEmail } = useAuthStore();

    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle pasted value or single character input
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            // Fill newCode with pasted characters
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);

            // Move focus to the next empty input or the last input
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            // Update the individual digit in the code array
            newCode[index] = value.slice(0, 1); // Ensure only one character is stored
            setCode(newCode);

            // Move focus to the next input if current one is filled
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");

        // Check if the verification code is valid (length check)
        if (verificationCode.length < 6) {
            setError("Please enter a complete 6-digit verification code.");
            return;
        }

        try {
            const response = await verifyEmail(verificationCode);
            if (response.success) {
                navigate("/");
                toast.success("Email verified successfully");
            } else {
                setError("Invalid verification code. Please try again.");
            }
        } catch (error) {
            console.log(error);
            setError("An error occurred during verification.");
        }
    };

    return (
        <div className="flex h-screen bg-blue-600">
            {/* Left side */

            /*
            <div className="w-1/2 p-12 flex flex-col justify-between text-white">
                <div>
                    <div className="text-4xl mb-4">*</div>
                    <h1 className="text-5xl font-bold mb-4">Verify Your Email!</h1>
                    <p className="text-xl">
                        Enter the 6-digit code sent to your email address.
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
                    <h2 className="text-2xl font-bold mb-2">Application Name</h2>
                    <h3 className="text-xl font-semibold mb-4">Enter Verification Code</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-between">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-2xl font-bold bg-gray-200 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading || code.some((digit) => !digit)}
                            className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;

*/
