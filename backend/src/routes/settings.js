import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Buscar filtros e favoritos do usuário logado
router.get('/', authMiddleware, async (req, res) => {
  res.json({
    filtros: req.user.filtros || {},
    favoritos: req.user.favoritos || []
  });
});

// Atualizar filtros (merge ao invés de sobrescrever)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const novosFiltros = req.body;

    // Atualizar apenas os campos enviados no body
    req.user.filtros = {
      ...req.user.filtros, // mantém os campos antigos
      ...novosFiltros      // sobrescreve os novos
    };

    await req.user.save();

    res.json({ message: 'Filtros atualizados com sucesso!' });
  } catch (err) {
    console.error('[SETTINGS] Erro ao atualizar filtros:', err.message);
    res.status(500).json({ message: 'Erro ao atualizar filtros.' });
  }
});

export default router;
