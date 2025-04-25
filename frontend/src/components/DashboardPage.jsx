import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from './Sidebar';
import { Modal } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function DashboardPage() {
  const [dados, setDados] = useState([]);
  const [favoritos, setFavoritos] = useState(() => JSON.parse(localStorage.getItem('favoritos')) || []);
  const [lucroMinimo, setLucroMinimo] = useState('');
  const [symbolFiltro, setSymbolFiltro] = useState('');
  const [intervalo, setIntervalo] = useState(1);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [verTodos, setVerTodos] = useState(false);

  const [parSelecionado, setParSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [historicoPorPar, setHistoricoPorPar] = useState({});
  const navigate = useNavigate();

  const carregar = async () => {
    try {
      const res = await api.get('/monitor');
      const incoming = res.data;
      if (!Array.isArray(incoming)) return;

      setDados((atual) => {
        const mapa = new Map(atual.map((d) => [d.symbol, d]));
        incoming.forEach((novo) => {
          if (mapa.has(novo.symbol)) {
            const atual = mapa.get(novo.symbol);
            mapa.set(novo.symbol, { ...atual, ...novo });
          } else {
            mapa.set(novo.symbol, novo);
          }
        });
        return Array.from(mapa.values());
      });

      registrarHistorico(incoming);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  // ✅ NOVA LÓGICA DE ATUALIZAÇÃO
  useEffect(() => {
    let cancelado = false;

    const loop = async () => {
      while (!cancelado) {
        await carregar();
        await new Promise((res) => setTimeout(res, intervalo * 1000));
      }
    };

    loop();
    return () => { cancelado = true; };
  }, [intervalo]);

  useEffect(() => {
    api.post('/settings', {
      filtros: { lucroMinimo, symbolFiltro, intervalo },
      favoritos
    });
  }, [lucroMinimo, symbolFiltro, intervalo, favoritos]);

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

  const registrarHistorico = (lista) => {
    if (!Array.isArray(lista)) return;
    const now = Date.now();
    const atualizados = { ...historicoPorPar };
    lista.forEach((d) => {
      if (!atualizados[d.symbol]) atualizados[d.symbol] = [];
      atualizados[d.symbol].push({
        timestamp: now,
        spot: d.spotAverage,
        index: d.indexPrice,
        fair: d.fairPrice
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

  const toggleFavorito = (symbol) => {
    const atualizados = favoritos.includes(symbol)
      ? favoritos.filter((s) => s !== symbol)
      : [...favoritos, symbol];
    setFavoritos(atualizados);
    localStorage.setItem('favoritos', JSON.stringify(atualizados));
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

  const classificarOportunidade = (symbol) => {
    const hist = historicoPorPar[symbol];
    if (!Array.isArray(hist) || hist.length < 5) return 'normal';
    const spreads = hist.map((h) => ((h.index - h.spot) / h.spot) * 100);
    const media = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    const desvio = Math.sqrt(spreads.map((s) => (s - media) ** 2).reduce((a, b) => a + b, 0) / spreads.length);
    const ultimo = spreads.at(-1);
    if (Math.abs(ultimo - media) > 2 * desvio) return 'alta';
    if (desvio > 2.5) return 'possível armadilha';
    return 'normal';
  };

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
            <button className={`btn btn-outline-secondary ${darkMode ? 'text-white' : ''}`} onClick={carregar}>
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
              <th>Moeda</th>
              <th>Spot Médio</th>
              <th>Índice</th>
              <th>Justo</th>
              <th>Lucro (%)</th>
            </tr>
          </thead>
          <tbody>
            {(verTodos ? dados : dados.slice(0, 10)).map((d) => (
              <tr key={d.symbol} onClick={() => { setParSelecionado(d); setMostrarModal(true); }} style={{ cursor: 'pointer' }}>
                <td>
                  <span onClick={(e) => { e.stopPropagation(); toggleFavorito(d.symbol); }}>
                    {favoritos.includes(d.symbol) ? '⭐' : '☆'} {d.symbol}
                  </span>
                </td>
                <td>{d.spotAverage?.toFixed(4) ?? '-'}</td>
                <td>{d.indexPrice ?? '-'}</td>
                <td>{d.fairPrice ?? '-'}</td>
                <td>
                  <span className={badgeLucro(d.spreadIndex)}>{d.spreadIndex}%</span><br />
                  <small>{classificarOportunidade(d.symbol)}</small>
                </td>
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
                  <Line dataKey="index" stroke="#82ca9d" name="Índice" />
                  <Line dataKey="fair" stroke="#ff7300" name="Justo" />
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
