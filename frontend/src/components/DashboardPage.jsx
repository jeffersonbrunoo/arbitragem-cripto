import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from './Sidebar';
import socket from '../services/socket';
import { Modal } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function DashboardPage() {
  const [dados, setDados] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [lucroMinimo, setLucroMinimo] = useState('');
  const [symbolFiltro, setSymbolFiltro] = useState('');
  const [intervalo, setIntervalo] = useState(1);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [verTodos, setVerTodos] = useState(false);
  const [parSelecionado, setParSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [historicoPorPar, setHistoricoPorPar] = useState({});
  const [highlighted, setHighlighted] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data.filtros) {
        setLucroMinimo(res.data.filtros.lucroMinimo || '');
        setSymbolFiltro(res.data.filtros.symbolFiltro || '');
        setIntervalo(res.data.filtros.intervalo || 1);
      }
      setFavoritos(res.data.favoritos || []);
    });
  }, []);

  useEffect(() => {
    api.post('/settings', {
      filtros: { lucroMinimo, symbolFiltro, intervalo },
      favoritos
    });
  }, [lucroMinimo, symbolFiltro, intervalo, favoritos]);

  useEffect(() => {
    socket.on('spotData', ({ symbol, data }) => {
      if (!data) return;
  
      console.log(`📥 [Socket] Recebido: ${symbol}`);
      console.table({ ...data });
  
      setDados(prev => {
        const filtered = prev.filter(p => p.symbol !== symbol);
        const atualizados = [...filtered, { symbol, ...data }];
        console.log('📊 [State] Novo estado de dados:', atualizados);
        return atualizados;
      });
  
      registrarHistorico([{ symbol, ...data }]);
  
      setHighlighted(h => ({ ...h, [symbol]: true }));
      setTimeout(() => setHighlighted(h => ({ ...h, [symbol]: false })), 700);
    });
  
    return () => socket.off('spotData');
  }, []);

  const registrarHistorico = (lista) => {
    const now = Date.now();
    const atualizados = { ...historicoPorPar };
    lista.forEach((d) => {
      if (!atualizados[d.symbol]) atualizados[d.symbol] = [];
      atualizados[d.symbol].push({
        timestamp: now,
        spot: d.spotPrice,
        future: d.futurePrice
      });
      if (atualizados[d.symbol].length > 20) {
        atualizados[d.symbol] = atualizados[d.symbol].slice(-20);
      }
    });
    setHistoricoPorPar(atualizados);
  };

  const badgeLucro = (valor) => {
    const v = parseFloat(valor);
    if (v >= 1) return 'badge bg-success';
    if (v < 0) return 'badge bg-danger';
    return 'badge bg-warning text-dark';
  };

  const toggleFavorito = async (symbol) => {
    const res = await api.post('/me/favoritos', { symbol });
    setFavoritos(res.data.favoritos);
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const dadosFiltrados = dados
    .filter(d => (!lucroMinimo || parseFloat(d.lucro) >= parseFloat(lucroMinimo)))
    .filter(d => d.symbol.toLowerCase().includes(symbolFiltro.toLowerCase()))
    .sort((a, b) => {
      const afav = favoritos.includes(a.symbol);
      const bfav = favoritos.includes(b.symbol);
      if (afav === bfav) return a.symbol.localeCompare(b.symbol);
      return afav ? -1 : 1;
    });

  return (
    <div className="d-flex">
      <Sidebar
        lucroMinimo={lucroMinimo}
        setLucroMinimo={setLucroMinimo}
        symbolFiltro={symbolFiltro}
        setSymbolFiltro={setSymbolFiltro}
        intervalo={intervalo}
        setIntervalo={setIntervalo}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />
      <div className={`flex-grow-1 p-3 ${darkMode ? 'bg-dark text-white' : ''}`}>
        <div className="d-flex justify-content-between align-items-center">
          <h4>Oportunidades</h4>
          <div className="d-flex gap-2">
            <button className={`btn btn-outline-secondary ${darkMode ? 'text-white' : ''}`} onClick={() => {}}>
              🔄 Atualizar
            </button>
            <button className="btn btn-outline-danger" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="mb-2 text-end">
          <button className="btn btn-sm btn-outline-primary" onClick={() => setVerTodos(!verTodos)}>
            {verTodos ? '🔽 Ver menos' : '🔼 Ver todos'}
          </button>
        </div>

        <table className={`table table-bordered table-hover mt-2 ${darkMode ? 'table-dark text-white' : ''}`}>
          <thead>
            <tr>
              <th>★</th>
              <th>Moeda</th>
              <th>Spot</th>
              <th>Future</th>
              <th>Volume 24h</th>
              <th>Lucro (%)</th>
              <th>Encontros</th>
            </tr>
          </thead>
          <tbody>
            {(verTodos ? dadosFiltrados : dadosFiltrados.slice(0, 10)).map((d) => (
              <tr key={d.symbol} onClick={() => { setParSelecionado(d); setMostrarModal(true); }} style={{ cursor: 'pointer' }} className={highlighted[d.symbol] ? 'table-warning' : ''}>
                <td onClick={(e) => { e.stopPropagation(); toggleFavorito(d.symbol); }} style={{ cursor: 'pointer' }}>
                  {favoritos.includes(d.symbol) ? '★' : '☆'}
                </td>
                <td>{d.symbol}</td>
                <td>{d.spotPrice?.toFixed(4) ?? '-'}</td>
                <td>{d.futurePrice?.toFixed(4) ?? '-'}</td>
                <td>{d.volume24h?.toLocaleString() ?? '-'}</td>
                <td><span className={badgeLucro(d.lucro)}>{d.lucro}%</span></td>
                <td>{d.encontros}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{parSelecionado?.symbol}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {parSelecionado && (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicoPorPar[parSelecionado.symbol]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="spot" stroke="#8884d8" name="Spot" />
                  <Line dataKey="future" stroke="#82ca9d" name="Future" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default DashboardPage;
