import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.token && res.data.token.split('.').length === 3) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        alert('Token inválido recebido');
      }
    } catch (err) {
      alert('Login inválido');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">Entrar</h2>
      <form onSubmit={login}>
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
        <button type="submit" className="btn btn-primary w-100 mb-3">Entrar</button>
      </form>

      <div className="text-center">
        <Link to="/register" className="d-block mb-2">📋 Cadastrar-se</Link>
        <Link to="/forgot" className="d-block">🔐 Esqueci minha senha</Link>
      </div>
    </div>
  );
}

export default LoginPage;
