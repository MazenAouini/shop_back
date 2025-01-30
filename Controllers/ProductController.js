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
    });
    const subscribers = await Subscriber.find({});

    // Send email notifications
    await sendNewProductNotification(subscribers, product);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    // If there's an error and a file was uploaded locally, clean it up
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export {Create,sendNewProductNotification}