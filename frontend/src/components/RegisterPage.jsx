import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('As senhas não coincidem');
      return;
    }

    try {
      await api.post('/auth/register', { email, password });
      alert('Cadastro realizado com sucesso');
      navigate('/login');
    } catch (err) {
      alert('Erro ao cadastrar');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">Cadastrar</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirmar Senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-success w-100 mb-3">Registrar</button>
      </form>
      <div className="text-center">
        <Link to="/login">Já tem conta? Entrar</Link>
      </div>
    </div>
  );
}

export default RegisterPage;