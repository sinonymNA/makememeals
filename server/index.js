import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

import sql from './db.js';
import mealsRouter from './routes/meals.js';
import groceryRouter from './routes/grocery.js';
import userRouter from './routes/user.js';
import paymentsRouter from './routes/payments.js';
import guestRouter from './routes/guest.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, '../client/dist');

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/meals', mealsRouter);
app.use('/api/grocery', groceryRouter);
app.use('/api/user', userRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/guest', guestRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve the built React app for production
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

async function migrate() {
  const schemaPath = join(__dirname, '../db/schema.sql');
  if (!existsSync(schemaPath)) return;
  const schema = readFileSync(schemaPath, 'utf8');
  await sql.unsafe(schema);
  console.log('Database schema ready');
}

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MakeMeMeals server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
