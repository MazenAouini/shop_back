import express from 'express';
import Commande from '../Models/CommandeModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new order
router.post('/', protect, async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        
        const order = await Commande.create({
            user: req.user._id,
            products,
            shippingAddress,
            status: 'pending'
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's orders
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Commande.find({ user: req.user._id })
            .populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router; 