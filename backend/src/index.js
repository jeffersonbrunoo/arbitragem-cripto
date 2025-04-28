import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import monitorRoutes from './routes/monitor.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import forgotRoutes from './routes/forgot.js';
import resetRoutes from './routes/reset.js';
import meRoutes from './routes/me.js';



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/monitor', monitorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', forgotRoutes);
app.use('/api/auth', resetRoutes);
app.use('/api/me', meRoutes);


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
  });

export default app;
