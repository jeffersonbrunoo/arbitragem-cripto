// src/components/DashboardPage.jsx
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from './Sidebar';
import CoinActionButton from './CoinActionButton';
import socket from '../services/socket';
import { ThemeContext } from '../contexts/ThemeContext';

export default function DashboardPage() {
  const { darkMode } = useContext(ThemeContext);
  const [dados, setDados] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [lucroMinimo, setLucroMinimo] = useState('');
  const [symbolFiltro, setSymbolFiltro] = useState('');
  const [intervalo, setIntervalo] = useState(1);
  const [verTodos, setVerTodos] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wsStatus, setWsStatus] = useState('desconectado');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/settings').then(res => {
      const { filtros = {}, favoritos = [] } = res.data;
      setLucroMinimo(filtros.lucroMinimo ?? '');
      setSymbolFiltro(filtros.symbolFiltro ?? '');
      setIntervalo(filtros.intervalo ?? 1);
      setFavoritos(favoritos);
    });
  }, []);

  useEffect(() => {
    api.post('/settings', {
      filtros: { lucroMinimo, symbolFiltro, intervalo },
      favoritos
    });
  }, [lucroMinimo, symbolFiltro, intervalo, favoritos]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setWsStatus('online'));
    socket.on('disconnect', () => setWsStatus('offline'));
    socket.on('error', () => setWsStatus('erro'));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    socket.on('spotData', ({ symbol, data }) => {
      if (!data) return;
      setDados(prev => {
        const filtered = prev.filter(p => p.symbol !== symbol);
        return [...filtered, { symbol, ...data }];
      });
    });
    return () => socket.off('spotData');
  }, []);

  const badgeLucro = valor => {
    const v = parseFloat(valor);
    if (v >= 1) return 'badge bg-success';
    if (v < 0) return 'badge bg-danger';
    return 'badge bg-warning text-dark';
  };

  const toggleFavorito = async symbol => {
    const res = await api.post('/me/favoritos', { symbol });
    setFavoritos(res.data.favoritos);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCoinAction = symbol => {
  const formatted = symbol.replace('USDT', '_USDT');

  // Reutiliza as abas nomeadas
  window.open(`https://www.mexc.com/exchange/${formatted}`, 'mexcSpot');
  window.open(`https://futures.mexc.com/exchange/${formatted}`, 'mexcFutures');
};

  const dadosFiltrados = useMemo(() => {
    return dados
      .filter(d => (!lucroMinimo || parseFloat(d.lucro) >= parseFloat(lucroMinimo)))
      .filter(d => d.symbol.toLowerCase().includes(symbolFiltro.toLowerCase()))
      .sort((a, b) => {
        const af = favoritos.includes(a.symbol);
        const bf = favoritos.includes(b.symbol);
        if (af !== bf) return af ? -1 : 1;
        const pa = parseFloat(a.lucro);
        const pb = parseFloat(b.lucro);
        if (pb !== pa) return pb - pa;
        return a.symbol.localeCompare(b.symbol);
      });
  }, [dados, lucroMinimo, symbolFiltro, favoritos]);

  return (
    <div className="d-flex flex-column flex-md-row">
      <Sidebar
        lucroMinimo={lucroMinimo}
        setLucroMinimo={setLucroMinimo}
        symbolFiltro={symbolFiltro}
        setSymbolFiltro={setSymbolFiltro}
        intervalo={intervalo}
        setIntervalo={setIntervalo}
        isOpen={sidebarOpen}
        toggleOpen={() => setSidebarOpen(o => !o)}
        wsStatus={wsStatus}
      />

      <div className={`flex-grow-1 p-3 ${darkMode ? 'bg-dark text-white' : ''}`}>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-2 gap-2">
          <h4>MONITOR DE PREÇOS</h4>
        </div>

        <div className="table-responsive">
          <table className={`table table-bordered table-hover mt-2 ${darkMode ? 'table-dark text-white' : ''}`}>
            <thead>
              <tr className="text-center">
                <th>★</th>
                <th>Moeda</th>
                <th>Spot</th>
                <th>Future</th>
                <th>Lucro Entrada</th>
                <th>Lucro Saída</th>
                <th>Encontros</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(verTodos ? dadosFiltrados : dadosFiltrados.slice(0, 50)).map(d => (
                <tr key={d.symbol} className="text-center" style={{ cursor: 'pointer', color: darkMode ? 'white' : 'black' }}>
                  <td onClick={e => { e.stopPropagation(); toggleFavorito(d.symbol); }} style={{ cursor: 'pointer' }}>
                    {favoritos.includes(d.symbol) ? '★' : '☆'}
                  </td>
                  <td>{d.symbol.replace('USDT', '')}</td>
                  <td>{d.spotPrice ?? '-'}</td>
                  <td>{d.futurePrice ?? '-'}</td>
                  <td>
                    <span className={badgeLucro(d.lucro)}>{d.lucro}%</span>
                  </td>
                  <td>
                    <span className={badgeLucro(d.lucroReverso)}>{d.lucroReverso ?? '-'}%</span>
                  </td>
                  <td>{d.encontros}</td>
                  <td className="text-center align-middle" onClick={e => e.stopPropagation()}>
                    <CoinActionButton symbol={d.symbol} onClick={handleCoinAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
