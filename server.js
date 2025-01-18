const express = require('express');
const dotEnv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const upload = require('./utils/multerUtils');
const cors = require('cors');
const parcelRouetes = require('./routes/parcelRoutes');

dotEnv.config();

const app = express();

app.use(cors());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dummy data
const dummy = { hello: 'hello' };

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

// Test route
app.get('/', (req, res) => {
    res.json(dummy);
});

// Authentication routes
app.use('/api/auth', authRoutes);

app.use('/api/parcel', parcelRouetes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
