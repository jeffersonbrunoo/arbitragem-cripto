import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

import monitorRoutes, { setupSocketMonitor } from './routes/monitor.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import forgotRoutes from './routes/forgot.js';
import resetRoutes from './routes/reset.js';
import meRoutes from './routes/me.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/monitor', monitorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', forgotRoutes);
app.use('/api/auth', resetRoutes);
app.use('/api/me', meRoutes);

// Inicia monitoramento via socket.io
setupSocketMonitor(io);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  });

export default app;