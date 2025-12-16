const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');


// Route files
const authRoutes = require('./src/routers/auth');
const weddingRoutes = require('./src/routers/weddings');
const guestRoutes = require('./src/routers/guests');
const vendorRoutes = require('./src/routers/vendors');
const bookingRoutes = require('./src/routers/bookings');
const budgetRoutes = require('./src/routers/budgets');
const eventRoutes = require('./src/routers/events');
const taskRoutes = require('./src/routers/tasks');
const reminderRoutes = require('./src/routers/reminders');
const publicWeddingRoutes = require('./src/routers/publicWedding');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: '*', // Allow all origins (development only!)
  credentials: true
}));
app.use(express.json());

const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path} :${new Date().toISOString()}`);
  next();
};

app.get('/', (req, res) => {
  res.send('WedVow API is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is Running successfully',
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/weddings', weddingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes );
app.use('/api/public', publicWeddingRoutes);

app.use(requestLogger);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
