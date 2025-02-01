import ProductModel from '../Models/ProductsModel.js'
import Subscriber from '../Models/SubscriptionModel.js';
import nodemailer from 'nodemailer'
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service (e.g., Gmail, SendGrid)
    auth: {
      user: process.env.EMAIL_USER, // Store in .env
      pass: process.env.EMAIL_PASS, // Store in .env
    },
  });
  
  const sendNewProductNotification = async (subscribers, product) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      subject: 'New Product Alert!',
      text: `Hi there! A new product has been added: ${product.name}. Check it out now!`,
      html: `<p>Hi there! A new product has been added: <strong>${product.name}</strong>. Check it out now!</p>`,
    };
  
    try {
      for (const subscriber of subscribers) {
        mailOptions.to = subscriber.email;
        await transporter.sendMail(mailOptions);
      }
      console.log('Emails sent successfully');
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  };

// add product
const Create = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.id !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to perform this action"
      });
    }

    const { name, price, mark, category, sizes } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products",
      use_filename: true,
      unique_filename: true,
    });

    // Delete the file from local storage after upload
    fs.unlinkSync(file.path);

    // Parse sizes and stock
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    
    // Create new product with Cloudinary URL
    const product = await ProductModel.create({
      name,
      price: Number(price),
      mark,
      category,
      sizes: parsedSizes,
      image: [result.secure_url],
      createdBy: req.user.id // Add creator reference
    });

    const subscribers = await Subscriber.find({});
    await sendNewProductNotification(subscribers, product);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// list product
const listProduct = async (req, res) => {
  try {
    const products = await ProductModel.find();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in listProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Parse the stock data
    if (updateData.stock) {
      const stockArray = JSON.parse(updateData.stock);
      const stockMap = new Map();
      stockArray.forEach(({ size, quantity }) => {
        stockMap.set(size, quantity);
      });
      updateData.stock = stockMap;
    }

    // Parse sizes if present
    if (updateData.sizes) {
      updateData.sizes = JSON.parse(updateData.sizes);
    }

    // Only update image if a new file was uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      // Remove image field if no new file was uploaded
      delete updateData.image;
    }

    const product = await ProductModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};
// delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete from Cloudinary if image exists and is a Cloudinary URL
    if (product.image && Array.isArray(product.image)) {
      for (const imageUrl of product.image) {
        if (imageUrl && imageUrl.includes("cloudinary")) {
          try {
            // Extract public ID correctly
            const splitUrl = imageUrl.split("/");
            const publicId = `products/${
              splitUrl[splitUrl.length - 1].split(".")[0]
            }`;

            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error("Error deleting from Cloudinary:", cloudinaryError);
            // Continue with deletion even if Cloudinary fails
          }
        }
      }
    }

    // Delete the product from database
    await ProductModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};
// single product info
const singleProductInfo = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error in singleProductInfo:", {
      error: error.message,
      stack: error.stack,
      productId: req.params.id,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add other protected routes here
export { Create,listProduct,deleteProduct,updateProduct,singleProductInfo};