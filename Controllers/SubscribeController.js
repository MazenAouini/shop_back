import express from 'express';
import Subscriber from "../Models/SubscriptionModel.js";  // Add .js extension

const Subscribe = async (req, res) => {
    const { email } = req.body;
    try {
        // Check if email already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }
  
        // Save new subscriber
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
  
        res.status(201).json({ message: 'Subscription successful!' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export { Subscribe };