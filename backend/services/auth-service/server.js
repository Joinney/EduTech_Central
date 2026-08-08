const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./configs/db.config');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());

// Tăng giới hạn dung lượng payload nhận dữ liệu Base64 từ Client
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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