import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mark: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    sizes: {
        type: Array,
        required: true
    },
}, {
    timestamps: true
});

const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);

export default ProductModel;
