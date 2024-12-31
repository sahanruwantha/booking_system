const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./utils/db');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;