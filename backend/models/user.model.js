import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: function() {
				return !this.googleId;
			},
		},
		name: {
			type: String,
			required: true,
		},
		googleId: {
			type: String,
			unique: true,
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		paperTradingBalance: {
			type: Number,
			default: 100000, // Starting balance
		},
		investments: [
			{
				stockSymbol: String,
				amountInvested: Number,
				quantity: Number,
				date: { type: Date, default: Date.now },
			},
		],
		transactions: [
			{
				type: {
					type: String, // 'buy' or 'sell'
					required: true,
				},
				stockSymbol: {
					type: String,
					required: true,
				},
				amount: {
					type: Number,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
				date: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);
