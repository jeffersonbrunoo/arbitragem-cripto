import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!email.includes('@')) {
      setErro('E-mail inválido');
      return;
    }
    if (password.length < 8) {
      setErro('Senha muito curta (mínimo 8 caracteres)');
      return;
    }
    if (password !== confirm) {
      setErro('Senhas não coincidem');
      return;
    }

    try {
      await api.post('/auth/register', { email, password });
      setMensagem('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao registrar usuário.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">Criar Conta</h3>

      {mensagem && <div className="alert alert-success text-center">{mensagem}</div>}
      {erro && <div className="alert alert-danger text-center">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Digite sua senha (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirmar senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary w-100">Cadastrar</button>
      </form>

      <div className="text-center mt-3">
        <Link to="/login">Já tem uma conta? Faça login</Link>
      </div>
    </div>
  );
}

export default RegisterPage;
