import express from "express";
import passport from "passport";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	invest,
	sell,
	getPortfolioData,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import crypto from "crypto";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/invest", verifyToken, invest); 

router.post('/sell', verifyToken, sell);

router.get('/', verifyToken, getPortfolioData);

// Google OAuth routes
router.get('/google', (req, res, next) => {
	const state = crypto.randomBytes(20).toString('hex');
	res.cookie('oauth_state', state, { 
		httpOnly: true, 
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'  // Need lax here specifically for OAuth redirect
	});
	
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		state: state
	})(req, res, next);
});

router.get('/google/callback', 
	(req, res, next) => {
		const state = req.cookies['oauth_state'];
		if (req.query.state !== state) {
			return res.redirect('http://localhost:5173/login?error=invalid_state');
		}
		res.clearCookie('oauth_state');
		next();
	},
	passport.authenticate('google', { 
		failureRedirect: 'http://localhost:5173/login'
	}),
	(req, res) => {
		try {
			if (!req.user) {
				return res.redirect('http://localhost:5173/login');
			}
			
			// Generate token and set cookie
			generateTokenAndSetCookie(res, req.user._id);
			
			// Redirect to home page with success
			res.redirect('http://localhost:5173');
		} catch (error) {
			res.redirect('http://localhost:5173/login');
		}
	}
);

export default router;