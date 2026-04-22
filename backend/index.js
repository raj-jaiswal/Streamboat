require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/copyright', require('./routes/claimRoutes'));

app.get('/', (req, res) => {
  res.send('Streamboat API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
