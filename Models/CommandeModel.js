import mongoose from 'mongoose';

const commandeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: {type: Number, required: true}
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Add an index for better query performance
commandeSchema.index({ user: 1, createdAt: -1 });

// Calculate total amount before saving
commandeSchema.pre('save', function(next) {
    if (this.products && this.products.length > 0) {
        this.totalAmount = this.products.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    next();
});

const Commande = mongoose.model('Commande', commandeSchema);

export default Commande;