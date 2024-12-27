const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('../../authentication_service/src/routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount authentication routes
app.use('/auth', authRoutes);

// Mount API routes
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;