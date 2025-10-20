import express from "express";
import { connectDB } from './db/connectDB.js';
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';

import passport from 'passport';
import session from 'express-session';
import './config/passport-setup.js';

import axios from 'axios';

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials: true,
    exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);

app.get('/api/quote', async (req, res) => {
    const { symbol } = req.query;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
            params: {
                symbol: symbol,
                token: process.env.FINNHUB_API_KEY
            },
            headers: {
                'Accept': 'application/json',
                // Don't accept cookies from Finnhub
                'Cookie': ''
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from Finnhub' });
    }
});

app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
    connectDB();
});