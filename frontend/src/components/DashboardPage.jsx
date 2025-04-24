import { useEffect, useState } from 'react';
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
  const [intervalo, setIntervalo] = useState(30);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const [parSelecionado, setParSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [historicoPorPar, setHistoricoPorPar] = useState({});

  const carregar = async () => {
    try {
      const res = await api.get('/monitor');
      const data = res.data;

      if (Array.isArray(data)) {
        setDados(data);
        registrarHistorico(data);
      } else {
        console.warn('Resposta inválida da API /monitor:', data);
        setDados([]);
      }
    } catch (err) {
      console.error('Erro ao buscar dados /monitor:', err);
      setDados([]);
    }
  };

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, intervalo * 1000);
    return () => clearInterval(interval);
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
        setIntervalo(res.data.filtros.intervalo || 30);
      }
      setFavoritos(res.data.favoritos || []);
    });
  }, []);

  const registrarHistorico = (lista) => {
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

  const filtrados = (Array.isArray(dados) ? dados : []).filter((d) => {
    const lucroOk = lucroMinimo ? parseFloat(d.spreadIndex) >= parseFloat(lucroMinimo) : true;
    const simboloOk = symbolFiltro ? d.symbol.includes(symbolFiltro.toUpperCase()) : true;
    return lucroOk && simboloOk;
  });

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

  const classificarOportunidade = (symbol) => {
    const hist = historicoPorPar[symbol];
    if (!hist || hist.length < 5) return 'normal';

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
      <div className={`flex-grow-1 p-3 ${darkMode ? 'bg-dark text-light' : ''}`}>
        <h4 className="d-flex justify-content-between">
          Oportunidades
          <button className="btn btn-outline-secondary" onClick={() => carregar()}>🔄 Atualizar</button>
        </h4>

        {filtrados.length === 0 && (
          <div className="alert alert-warning text-center">
            Nenhuma oportunidade encontrada. Verifique os filtros ou tente novamente.
          </div>
        )}

        <table className="table table-bordered table-hover mt-3">
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
            {filtrados.map((d) => (
              <tr key={d.symbol} onClick={() => { setParSelecionado(d); setMostrarModal(true); }} style={{ cursor: 'pointer' }}>
                <td>
                  <span onClick={(e) => { e.stopPropagation(); toggleFavorito(d.symbol); }}>
                    {favoritos.includes(d.symbol) ? '⭐' : '☆'} {d.symbol}
                  </span>
                </td>
                <td>{d.spotAverage.toFixed(4)}</td>
                <td>{d.indexPrice}</td>
                <td>{d.fairPrice}</td>
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
