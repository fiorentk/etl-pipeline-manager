import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import entityRoutes from './routes/entities';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes — specific routes must be registered BEFORE the wildcard /:type entity router
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', entityRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
