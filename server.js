const express = require('express');
const dotEnv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotEnv.config();
const app = express();

app.use(express.json());

connectDB();

const dummy = {
    hello: 'hello',
};

app.get('/', (req, res) => {
    res.json(dummy);
});
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
