const express = require('express');
const dotEnv = require('dotenv');
const connectDB = require('./config/db');

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
