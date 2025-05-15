// src/components/Sidebar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';

function Sidebar({
  lucroMinimo,
  setLucroMinimo,
  symbolFiltro,
  setSymbolFiltro,
  intervalo,
  setIntervalo,
  isOpen,
  toggleOpen,
  wsStatus
}) {
  const { darkMode, toggleDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [logoutMsg, setLogoutMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    api.get('/me')
      .then(res => setUserEmail(res.data.user.email))
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogoutMsg('Logout realizado com sucesso!');
    setTimeout(() => navigate('/login'), 1500);
  };

  const badgeClass =
    wsStatus === 'online' ? 'bg-success'
    : wsStatus === 'offline' ? 'bg-secondary'
    : 'bg-danger';

  return (
    <motion.div
      className={[
        'sidebar',
        isOpen ? 'sidebar--open' : 'sidebar--collapsed',
        darkMode ? 'sidebar--dark' : 'sidebar--light'
      ].join(' ')}
      animate={{ width: isOpen ? 260 : 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflowY: 'auto' }}
    >
      <div className="d-flex justify-content-between align-items-center px-2 pt-2">
        <button
          className="sidebar__toggle-btn"
          onClick={toggleOpen}
          aria-label="Alternar sidebar"
        >
          {isOpen ? '←' : '→'}
        </button>
        {isOpen && (
          <span className={`badge ${badgeClass}`}>● {wsStatus}</span>
        )}
      </div>

      {isOpen && (
        <div className="sidebar__content" style={{ paddingTop: '2rem' }}>
          <div className="sidebar__filters">
            <h5 className="sidebar__title">🔍 Filtros</h5>

            <label htmlFor="lucroMinimo" className="visually-hidden">Lucro mínimo</label>
            <input
              id="lucroMinimo"
              type="number"
              className="sidebar__input"
              placeholder="Lucro mínimo (%)"
              value={lucroMinimo || ''}
              onChange={e => setLucroMinimo(e.target.value)}
            />

            <label htmlFor="symbolFiltro" className="visually-hidden">Par de símbolo</label>
            <input
              id="symbolFiltro"
              type="text"
              className="sidebar__input"
              placeholder="Par (ex: BTC)"
              value={symbolFiltro || ''}
              onChange={e => setSymbolFiltro(e.target.value)}
            />
          </div>

          <div className="sidebar__theme-row d-flex align-items-center justify-content-between">
            <span className="sidebar__theme-label">
              {darkMode ? '☀️ Claro' : '🌙 Escuro'}
            </span>
            <div
              className={`sidebar__theme-toggle rounded-pill ${darkMode ? 'dark' : 'light'}`}
              onClick={() => toggleDark()}
              role="button"
              aria-label="Alternar tema"
            >
              <div className="sidebar__theme-thumb rounded-circle">
                {darkMode ? '🌙' : '☀️'}
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="sidebar__bottom">
          <button
            onClick={handleLogout}
            className="sidebar__logout-btn btn btn-danger w-100 mb-2"
            aria-label="Sair da conta"
          >
            🔒 Logout
          </button>

          {logoutMsg && (
            <div className="sidebar__logout-msg alert alert-success text-center p-2">
              {logoutMsg}
            </div>
          )}

          {userEmail && (
            <div className="sidebar__footer text-center small">
              Logado como:<br />
              <strong>{userEmail}</strong>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default Sidebar;
