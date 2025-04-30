import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion'; // Adiciona framer-motion

function Sidebar({
  lucroMinimo,
  setLucroMinimo,
  symbolFiltro,
  setSymbolFiltro,
  intervalo,
  setIntervalo,
  darkMode,
  toggleDark
}) {
  const navigate = useNavigate();
  const [logoutMsg, setLogoutMsg] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogoutMsg('Logout realizado com sucesso!');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className={`p-3 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`} style={{ minWidth: 260, height: '100vh' }}>
      <h5>🔍 Filtros</h5>

      <input
        type="number"
        className="form-control mb-2"
        placeholder="Lucro mínimo (%)"
        value={lucroMinimo}
        onChange={(e) => setLucroMinimo(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Par (ex: BTC)"
        value={symbolFiltro}
        onChange={(e) => setSymbolFiltro(e.target.value)}
      />

      <select
        className="form-select mb-3"
        value={intervalo}
        onChange={(e) => setIntervalo(Number(e.target.value))}
      >
        <option value={1}>Atualizar a cada 1s</option>
        <option value={10}>Atualizar a cada 10s</option>
        <option value={30}>Atualizar a cada 30s</option>
        <option value={60}>Atualizar a cada 60s</option>
      </select>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <span>{darkMode ? '☀️ Claro' : '🌙 Escuro'}</span>
        <motion.div
          className={`rounded-pill ${darkMode ? 'bg-light' : 'bg-dark'}`}
          style={{ width: 60, height: 30, position: 'relative', cursor: 'pointer', padding: 5 }}
          onClick={toggleDark}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="bg-primary rounded-circle"
            style={{
              width: 20,
              height: 20,
              position: 'absolute',
              top: 5,
              left: darkMode ? 30 : 5
            }}
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.div>
      </div>

      <hr />

      <button onClick={handleLogout} className="btn btn-danger w-100">
        🔒 Logout
      </button>

      {logoutMsg && (
        <div className="alert alert-success text-center p-2 mt-3" role="alert">
          {logoutMsg}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
