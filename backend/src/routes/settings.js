import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ filtros: user.filtros, favoritos: user.favoritos });
});

router.post('/', authMiddleware, async (req, res) => {
  const { filtros, favoritos } = req.body;
  await User.findByIdAndUpdate(req.user.userId, { filtros, favoritos });
  res.json({ ok: true });
});

export default router;
