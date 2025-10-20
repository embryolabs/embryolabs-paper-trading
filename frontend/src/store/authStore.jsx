import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,
	isGoogleAuthPending: false,

	signup: async (email, password, name) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, name });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return { success: true, user: response.data.user };
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			return { success: false, error: error.response?.data?.message || "Error signing up" };
		}
	},

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
			return { success: true, user: response.data.user }; // Successful login
		} catch (error) {
			set({ error: error.response?.data.message || "Error logging in", isLoading: false });
			return { success: false, message: error.response?.data.message || "Error logging in" }; // Ensure message is returned
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
			return { success: true };
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			return { success: false, error: "Error logging out" };
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return { success: true, user: response.data.user };
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			return { success: false, error: error.response?.data?.message || "Error verifying email" };
		}
	},

	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ 
				user: response.data.user, 
				isAuthenticated: true, 
				isCheckingAuth: false,
				isGoogleAuthPending: false
			});
			return { success: true, user: response.data.user };
		} catch (error) {
			set({ 
				user: null,
				error: null, 
				isCheckingAuth: false, 
				isAuthenticated: false,
				isGoogleAuthPending: false
			});
			return { success: false };
		}
	},

	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
			return { success: true, message: response.data.message };
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Error sending reset password email",
			});
			return { success: false, error: error.response?.data?.message || "Error sending reset password email" };
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
			return { success: true, message: response.data.message };
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Error resetting password",
			});
			return { success: false, error: error.response?.data?.message || "Error resetting password" };
		}
	},

	invest: async ({ stockSymbol, amountInvested, quantity }) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/invest`, { stockSymbol, amountInvested, quantity });
			set({ user: response.data.user, isLoading: false });
			return { success: true };
		} catch (error) {
			set({ error: error.response.data.message || "Error investing", isLoading: false });
			return { success: false, error: error.response?.data?.message || "Error investing" };
		}
	},
	sell: async ({ stockSymbol, quantity }) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/sell`, { stockSymbol, quantity });
			set({ user: response.data.user, isLoading: false });
			return { success: true };
		} catch (error) {
			console.error("Sell error:", error); // Log the error for debugging
			set({ error: error.response?.data?.message || "Error selling shares", isLoading: false });
			return { success: false, error: error.response?.data?.message || "Error selling shares" };
		}
	},

	handleGoogleLogin: () => {
		set({ 
			isGoogleAuthPending: true,
			isAuthenticated: false, // Ensure we're not authenticated during the process
			user: null
		});
		window.location.href = "http://localhost:5000/api/auth/google";
	},
}));
