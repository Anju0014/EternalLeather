import Razorpay from 'razorpay';

// Initialize Razorpay instance with your key ID and secret
 const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default razorpayInstance;