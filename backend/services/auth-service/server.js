const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./configs/db.config');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối Database
connectDB();

// Routes
app.use('/api/v1/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT}`);
});