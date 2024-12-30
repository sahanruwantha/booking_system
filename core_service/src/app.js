const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;