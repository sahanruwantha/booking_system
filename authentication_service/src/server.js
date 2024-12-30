require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Authentication server running on port ${PORT}`);
}); 