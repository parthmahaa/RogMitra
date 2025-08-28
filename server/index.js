import express from 'express'
import dotenv from 'dotenv';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js'
import appointmentRoutes from './routes/appointment.js'
import session from 'express-session'
import cors from 'cors'
dotenv.config();

const app = express();
connectDb();

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

/*---------- ROUTES ------------ */
app.use('/api/auth', authRoutes);
app.use('/api/appointment', appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});