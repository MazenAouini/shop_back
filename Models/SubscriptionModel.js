// models/Subscriber.js
import mongoose from 'mongoose'

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Basic email validation
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber