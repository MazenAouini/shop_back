import express from 'express';
import Commande from '../Models/CommandeModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all orders (admin only)
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const orders = await Commande.find({})
            .populate('user', 'name email')
            .populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status (admin only)
router.put('/orders/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Commande.findById(req.params.id);
        
        if (order) {
            order.status = status;
            if (status === 'shipped' && req.body.trackingNumber) {
                order.trackingNumber = req.body.trackingNumber;
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router; 