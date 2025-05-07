import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validation/auth.js';

const router = express.Router();

// Cadastro de usuário com validação via Joi
router.post(
  '/register',
  validate(registerSchema),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      // Verifica existência de usuário
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'E-mail já cadastrado.' });
      }
      // Cria usuário
      const hashedPassword = await bcrypt.hash(password, 10);
      await new User({
        email,
        password: hashedPassword,
        filtros: {},
        favoritos: []
      }).save();

      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
      console.error('[REGISTER] Erro interno:', err);
      res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
    }
  }
);

// Login de usuário existente com validação via Joi
router.post(
  '/login',
  validate(loginSchema),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email inválido' });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Senha inválida' });
      }
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.json({ token });
    } catch (err) {
      console.error('[LOGIN] Erro interno:', err);
      res.status(500).json({ message: 'Erro ao autenticar usuário.' });
    }
  }
);

export default router;
