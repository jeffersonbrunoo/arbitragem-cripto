// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const login = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token?.split('.').length === 3) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        alert('Token inválido recebido');
      }
    } catch {
      alert('Login inválido');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <header className="login-header-bar">
          <h2 className="login-header">Login</h2>
        </header>

        <form onSubmit={login} className="login-form">
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              className="login-input"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-eye"
              onClick={() => setShowPwd(v => !v)}
            >
              {showPwd ? <EyeSlash /> : <Eye />}
            </span>
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="login-links">
          <Link to="/register">📋 Cadastrar-se</Link>
          <Link to="/forgot">🔐 Esqueci minha senha</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
