import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE] Erro na autenticação:', err.message);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

export default authMiddleware;
