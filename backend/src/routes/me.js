import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Rota para buscar perfil
router.get('/', authMiddleware, async (req, res) => {
  res.json({
    email: req.user.email,
    favoritos: req.user.favoritos
  });
});

// Rota para trocar senha
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Buscar o usuário completo pelo ID
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar se senha atual bate
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha atual incorreta.' });
    }

    // Atualizar senha
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Erro no /change-password:', err.message);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

export default router;
