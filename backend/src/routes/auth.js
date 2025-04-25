import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Cadastro de usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar dados básicos
    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'E-mail inválido.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Senha muito curta. Mínimo 8 caracteres.' });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      filtros: {},
      favoritos: []
    });

    await user.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('[REGISTER] Erro interno:', err);
    res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
  }
});

// Login de usuário existente
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email inválido' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Senha inválida' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro ao autenticar' });
  }
});

export default router;
