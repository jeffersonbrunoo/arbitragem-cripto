import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// ROTA: POST /api/auth/reset
router.post('/', async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: new Date() } // Token ainda válido
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error('[RESET] Erro ao redefinir senha:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

export default router;
