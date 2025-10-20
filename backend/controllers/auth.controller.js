import bcryptjs from "bcryptjs";
import crypto from "crypto";
import axios from 'axios';

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
			paperTradingBalance: 100000, // Set initial balance
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		// Check if the user is verified
		if (!user.isVerified) {
			return res.status(403).json({ success: false, message: "Your account is not verified. Please check your email for the verification link." });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = (req, res) => {
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ error: 'Logout failed' });
		}
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).json({ error: 'Session destruction failed' });
			}
			// Clear all relevant cookies
			res.clearCookie("connect.sid");
			res.clearCookie("token");
			res.clearCookie("g_state"); 
			
			// Send response
			res.status(200).json({ success: true, message: "Logged out successfully" });
		});
	});
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const invest = async (req, res) => {
    const { stockSymbol, amountInvested, quantity } = req.body;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.paperTradingBalance < amountInvested) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // Check if the user already has an investment for the stock symbol
        const existingInvestment = user.investments.find(investment => investment.stockSymbol === stockSymbol);

        if (existingInvestment) {
            // Update the existing investment
            existingInvestment.quantity += parseFloat(quantity); // Add the new quantity to the existing quantity
            existingInvestment.action = 'buy'; // Set action to 'buy'
            existingInvestment.date = new Date(); // Update date to now
        } else {
            // Add a new investment if it doesn't exist
            user.investments.push({ stockSymbol, amountInvested, quantity: parseFloat(quantity), action: 'buy', date: new Date() });
        }

        // Log the transaction
        user.transactions.push({
            type: 'buy',
            stockSymbol,
            amount: amountInvested,
            quantity: parseFloat(quantity),
            date: new Date(),
        });

        // Deduct the investment amount from the user's balance
        user.paperTradingBalance -= amountInvested;

        await user.save();

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in invest ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const sell = async (req, res) => {
    const { stockSymbol, quantity } = req.body;

    // Validate input
    if (!stockSymbol || !quantity) {
        return res.status(400).json({ success: false, message: "Missing stock symbol or quantity." });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const existingInvestment = user.investments.find(investment => investment.stockSymbol === stockSymbol);
        if (!existingInvestment || existingInvestment.quantity < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient shares to sell" });
        }

        const currentPrice = await fetchCurrentPrice(stockSymbol);
        if (currentPrice === null) {
            return res.status(400).json({ success: false, message: "Could not fetch current price." });
        }

        const saleAmount = currentPrice * quantity;
        user.paperTradingBalance += saleAmount;
        existingInvestment.quantity -= quantity;
        existingInvestment.action = 'sell'; // Set action to 'sell'
        existingInvestment.date = new Date(); // Update date to now

        // Log the transaction
        user.transactions.push({
            type: 'sell',
            stockSymbol,
            amount: saleAmount,
            quantity,
            date: new Date(),
        });

        if (existingInvestment.quantity === 0) {
            user.investments = user.investments.filter(investment => investment.stockSymbol !== stockSymbol);
        }

        await user.save();
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in sell function:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const fetchCurrentPrice = async (stockSymbol) => {
    try {
        // Use your own API endpoint instead of calling Finnhub directly
        const response = await axios.get(`http://localhost:5000/api/quote?symbol=${stockSymbol}`, {
            headers: {
                'Accept': 'application/json',
                // Don't accept cookies
                'Cookie': ''
            }
        });
        return response.data.c; // Return the current price
    } catch (error) {
        console.error("Error fetching current price:", error);
        return null;
    }
};

export const getPortfolioData = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("investments paperTradingBalance transactions");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, investments: user.investments, balance: user.paperTradingBalance, transactions: user.transactions });
    } catch (error) {
        console.error("Error fetching portfolio data:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body; // Get the user's email from the request body
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Check if the cooldown period has expired
        const now = Date.now();
        if (user.lastVerificationEmailSent && (now - user.lastVerificationEmailSent < user.cooldownDuration)) {
            const remainingTime = user.cooldownDuration - (now - user.lastVerificationEmailSent);
            const remainingMinutes = Math.ceil(remainingTime / 1000 / 60);
            return res.status(429).json({ success: false, message: `Please wait ${remainingMinutes} minutes before resending the verification email.` });
        }

        // Generate a new verification token
        const newVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = newVerificationToken;
        user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        user.lastVerificationEmailSent = now; // Update the last sent time
        await user.save();

        // Send the verification email
        await sendVerificationEmail(user.email, newVerificationToken);

        res.status(200).json({ success: true, message: "Verification email resent successfully" });
    } catch (error) {
        console.log("Error in resendVerificationEmail ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};