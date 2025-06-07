// src/routes/me.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Buscar perfil
router.get('/', authMiddleware, async (req, res) => {
  res.json({
    email: req.user.email,
    favoritos: req.user.favoritos
  });
});

// Trocar senha
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha atual incorreta.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Erro no /change-password:', err.message);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Favoritar/desfavoritar
router.post('/favoritos', authMiddleware, async (req, res) => {
  const { symbol } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    let favoritos = user.favoritos || [];

    if (favoritos.includes(symbol)) {
      favoritos = favoritos.filter((s) => s !== symbol);
    } else {
      favoritos.push(symbol);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { favoritos },
      { new: true } // retorna documento atualizado
    );

    res.json({ favoritos: updatedUser.favoritos });
  } catch (err) {
    console.error('Erro ao atualizar favoritos:', err.message);
    res.status(500).json({ message: 'Erro interno ao atualizar favoritos' });
  }
});

// ✅ Exportação obrigatória para funcionar com `import meRoutes from ...`
export default router;
