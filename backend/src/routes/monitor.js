import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import WebSocket from 'ws';
import axios from 'axios';

const router = express.Router();
const FUTURE_WS_URL = 'wss://contract.mexc.com/edge';
const REST_SPOT_DEPTH_URL = 'https://api.mexc.com/api/v3/depth';
const REST_SPOT_24H_URL = 'https://api.mexc.com/api/v3/ticker/24hr';

const trackedPairs = [
  'BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'DOGEUSDT',
  'SOLUSDT', 'LTCUSDT', 'TRXUSDT', 'MATICUSDT'
];

const spotData = {};     // { symbol: price }
const futureData = {};   // { symbol: price }
const volume24h = {};    // { symbol: volume }
const encontros = {};    // { symbol: count }
let retryAttempt = 0;

// Fallback REST para SPOT (menor ask price)
async function fetchSpotPrices() {
  for (const symbol of trackedPairs) {
    try {
      const { data } = await axios.get(`${REST_SPOT_DEPTH_URL}?symbol=${symbol}&limit=5`);
      const ask = data.asks?.[0]?.[0];
      if (ask) {
        spotData[symbol] = parseFloat(ask);
        console.log(`✅ [SPOT REST] ${symbol} = ${spotData[symbol]}`);
      }
    } catch (err) {
      console.error(`❌ Erro SPOT REST ${symbol}:`, err.message);
    }
  }
}

function startFutureWebSocket() {
  const ws = new WebSocket(FUTURE_WS_URL);

  ws.on('open', () => {
    console.log('🟢 Future WebSocket conectado');
    retryAttempt = 0;

    const subs = trackedPairs.map(symbol => ({
      method: 'sub.deal',
      param: { symbol: symbol.replace('USDT', '_USDT') },
      id: Date.now()
    }));
    subs.forEach(sub => ws.send(JSON.stringify(sub)));
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (!data?.symbol || !data?.data?.p) return;

      const symbol = data.symbol.replace('_USDT', 'USDT');
      futureData[symbol] = parseFloat(data.data.p);
      console.log(`✅ Future atualizado: ${symbol} = ${futureData[symbol]}`);
    } catch (err) {
      console.error('❌ Erro no Future WS:', err.message);
    }
  });

  ws.on('close', () => {
    retryAttempt++;
    const delay = Math.min(30000, 1000 * 2 ** retryAttempt);
    console.warn(`🔄 Future WS desconectado. Reconectando em ${delay / 1000}s...`);
    setTimeout(startFutureWebSocket, delay);
  });
}

async function updateVolume24h() {
  try {
    const { data } = await axios.get(REST_SPOT_24H_URL);
    data.forEach(item => {
      if (trackedPairs.includes(item.symbol)) {
        volume24h[item.symbol] = parseFloat(item.quoteVolume || 0);
      }
    });
  } catch (err) {
    console.error('❌ Erro ao buscar volume 24h:', err.message);
  }
}

export function setupSocketMonitor(io) {
  startFutureWebSocket();
  setInterval(fetchSpotPrices, 5000);
  updateVolume24h();
  setInterval(updateVolume24h, 30000);

  console.log('🟢 Monitor socket ativo');

  setInterval(() => {
    trackedPairs.forEach(symbol => {
      const spot = spotData[symbol];
      const future = futureData[symbol];

      if (typeof spot === 'undefined' || typeof future === 'undefined') {
        console.log(`⏳ Aguardando dados para ${symbol}...`);
        return;
      }

      const lucro = (((future - spot) / spot) * 100).toFixed(2);
      encontros[symbol] = encontros[symbol] ?? 0;
      if (Math.abs(future - spot) < 0.0001) encontros[symbol]++;

      const payload = {
        symbol,
        data: {
          spotPrice: spot,
          futurePrice: future,
          volume24h: volume24h[symbol] || 0,
          lucro,
          encontros: encontros[symbol]
        }
      };

      console.log(`📊 Emitindo ${symbol} | Spot: ${spot} | Future: ${future} | Lucro: ${lucro}%`);
      io.emit('spotData', payload);
    });
  }, 1000);
}

router.get('/', authMiddleware, async (req, res) => {
  res.status(200).json([]);
});

export default router;
