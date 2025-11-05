// server/server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const swapRoutes = require('./routes/swapRoutes');

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
    res.send('SlotSwapper API is running!');
});

//Api routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/events', eventRoutes); // Event routes
app.use('/api/swaps', swapRoutes); // Swap routes

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));