import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

// ROTA: POST /api/auth/forgot
router.post('/', async (req, res) => {
  const { email } = req.body;
  console.log('[FORGOT] Solicitação recebida para e-mail:', email);

  try {
    const user = await User.findOne({ email });
    console.log('[FORGOT] Resultado da busca no banco:', user ? 'Usuário encontrado' : 'Usuário NÃO encontrado');

    // Retorna a mesma mensagem para evitar leak de e-mail existente
    if (!user) {
      return res.status(200).json({
        message: 'Se o e-mail estiver cadastrado, um link foi enviado para redefinição.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

    user.resetToken = token;
    user.resetTokenExpire = expire;
    await user.save();

    const resetLink = `http://localhost:5173/reset?token=${token}`;
    console.log(`[FORGOT] 🔗 Link de redefinição: ${resetLink}`);

    // Aqui seria o envio do e-mail com o resetLink (implementação futura)

    return res.json({
      message: 'Se o e-mail estiver cadastrado, um link foi enviado para redefinição.'
    });
  } catch (err) {
    console.error('[FORGOT] Erro interno ao processar requisição:', err);
    return res.status(500).json({ message: 'Erro interno.' });
  }
});

export default router;
