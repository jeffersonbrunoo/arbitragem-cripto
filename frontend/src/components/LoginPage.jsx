// src/components/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Eye, EyeSlash } from 'react-bootstrap-icons';  // <— ícones

function LoginPage() {
  const { darkMode, toggleDark } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);       // <— estado para visibilidade
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
    <div className={`login-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
        <header className="login-header-bar">
          <h2 className="login-header">Login</h2>
          <button type="button" className="toggle-theme-btn" onClick={toggleDark}>
            {darkMode ? '☀️ Claro' : '🌙 Escuro'}
          </button>
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

          {/* wrapper para mostrar/esconder senha */}
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
