require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Authentication server running on port ${PORT}`);
}); 