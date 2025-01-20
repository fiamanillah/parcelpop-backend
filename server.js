const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const upload = require('./utils/multerUtils');
const cors = require('cors');
const parcelRoutes = require('./routes/parcelRoutes'); // Fixed typo
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Stripe Payment Intent Route
app.post('/api/create-payment-intent', async (req, res) => {
    const { price } = req.body;

    console.log(price);

    if (!price) {
        return res.status(400).json({ error: 'Price is required' });
    }

    try {
        const amount = Math.round(price * 100); // Convert price to cents
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error.message);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl,
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Parcel routes
app.use('/api/parcel', parcelRoutes);

// User routes
app.use('/api', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
