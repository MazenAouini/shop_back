import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cloudinary from "cloudinary";
import path from "path";
import fs from 'fs';
import connectDB from "./configs/db.js";
import authRoutes from './Routes/authRoutes.js';
import subscriptionRoutes from './Routes/SubscriptionRoute.js';
import productRoutes from './Routes/ProductRoute.js';
import protect from './middleware/authMiddleware.js';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3004'], // Allow both ports
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// routes
app.get("/health", (req, res) => {
    res.send({ message: "health OK!" });
});
// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
// Protected routes
app.use('/api/products', protect, productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Start server with port handling
const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
                server.listen(PORT + 1);
            } else {
                console.error('Failed to start server:', err);
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();