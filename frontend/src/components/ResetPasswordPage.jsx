import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (password !== confirm) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      await api.post('/auth/reset', { token, password });
      setMensagem('Senha redefinida com sucesso.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao redefinir senha');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">Criar Nova Senha</h3>

      {mensagem && <div className="alert alert-success text-center">{mensagem}</div>}
      {erro && <div className="alert alert-danger text-center">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirmar nova senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Redefinir Senha</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
