import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import mealsRouter from './routes/meals.js';
import groceryRouter from './routes/grocery.js';
import userRouter from './routes/user.js';
import paymentsRouter from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe webhook needs raw body — must come before json middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/meals', mealsRouter);
app.use('/api/grocery', groceryRouter);
app.use('/api/user', userRouter);
app.use('/api/payments', paymentsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`MakeMeMeals server running on port ${PORT}`);
});
