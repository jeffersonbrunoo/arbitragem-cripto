import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import WebSocket from 'ws';
import axios from 'axios';
import Debug from 'debug';

const logInfo  = Debug('monitor:info');
const logWarn  = Debug('monitor:warn');
const logError = Debug('monitor:error');

const router = express.Router();

const FUTURE_WS_URL       = 'wss://contract.mexc.com/edge';
const SPOT_WS_URL         = 'wss://wbs-api.mexc.com/ws';
const REST_SYMBOLS_URL    = 'https://api.mexc.com/api/v3/ticker/price';
const REST_BOOKTICKER_URL = 'https://api.mexc.com/api/v3/ticker/bookTicker';

const THRESHOLD = 0.0001;

let trackedPairs = [];
const spotData           = {};
const futureData         = {};
const spotReverseData    = {};
const futureReverseData  = {};
const encontros           = {};
const lastConverged      = {};
let retryFuture = 0;
let retrySpot = 0;
const BLACKLIST = ['MAGAUSDT', 'ALTUSDT', 'QIUSDT'];

async function loadTrackedPairs() {
  try {
    const { data } = await axios.get(REST_SYMBOLS_URL);
    trackedPairs = data
      .map(item => item.symbol)
      .filter(sym => sym.endsWith('USDT') && !BLACKLIST.includes(sym));
    logInfo(`🔃 Carregado ${trackedPairs.length} pares USDT da MEXC (após filtro)`);
  } catch (err) {
    logError('❌ Falha ao carregar pares via ticker/price:', err.message);
  }
}

async function fetchSpotPrices() {
  try {
    const start = Date.now();
    const { data } = await axios.get(REST_BOOKTICKER_URL);
    if (!Array.isArray(data)) return;
    data.forEach(item => {
      if (item.symbol.endsWith('USDT')) {
        spotData[item.symbol] = item.askPrice;
        spotReverseData[item.symbol] = item.bidPrice;
      }
    });
    const duration = Date.now() - start;
    if (duration > 200) {
      logWarn(`⏱️ SPOT REST lento: ${duration}ms para ${Object.keys(spotData).length} símbolos`);
    }
  } catch (err) {
    logError('❌ Erro SPOT REST bookTicker:', err.message);
  }
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function startFutureWS() {
  const ws = new WebSocket(FUTURE_WS_URL);

  ws.on('open', () => {
    logInfo('🟢 Future WS conectado');
    retryFuture = 0;
    trackedPairs.forEach(symbol => {
      const symbolF = symbol.replace('USDT', '_USDT');
      ws.send(JSON.stringify({
        method: 'sub.depth.full',
        param: { symbol: symbolF, limit: 20, interval: '0' },
        id: Date.now(),
      }));
    });
  });

  ws.on('message', msg => {
    try {
      const d = JSON.parse(msg);
      const sym = d.symbol?.replace('_USDT', 'USDT');
      const bids = d.data?.bids;
      const asks = d.data?.asks;
      if (sym && Array.isArray(bids) && bids.length) {
        const bestBid = bids.reduce((max, curr) => Math.max(max, Number(curr[0])), 0);
        futureData[sym] = bestBid.toFixed(10);
      }
      if (sym && Array.isArray(asks) && asks.length) {
        const bestAsk = asks.reduce((min, curr) => Math.min(min, Number(curr[0])), Infinity);
        futureReverseData[sym] = bestAsk.toFixed(10);
      }
    } catch (err) {
      logError('❌ Erro Future WS:', err.message);
    }
  });

  ws.on('close', () => {
    retryFuture++;
    const delay = Math.min(30000, 1000 * 2 ** retryFuture);
    logWarn(`🔄 Future WS reconecta em ${delay/1000}s`);
    setTimeout(startFutureWS, delay);
  });
}

function startSpotWS(batch) {
  const ws = new WebSocket(SPOT_WS_URL);

  ws.on('open', () => {
    logInfo(`🟢 Spot WS conectado (batch de ${batch.length})`);
    retrySpot = 0;
    batch.forEach(sym => {
      ws.send(JSON.stringify({
        method: 'SUBSCRIPTION',
        params: [`spot@public.bookTicker.v3.api@${sym}`],
        id: Date.now(),
      }));
    });
    const ping = setInterval(() => ws.send(JSON.stringify({ method: 'PING', id: Date.now() })), 30000);
    ws.once('close', () => clearInterval(ping));
  });

  ws.on('message', msg => {
    try {
      const d = JSON.parse(msg);
      if (d.symbol && d.data?.askPrice && d.data?.bidPrice) {
        spotData[d.symbol] = d.data.askPrice;
        spotReverseData[d.symbol] = d.data.bidPrice;
      }
    } catch {}
  });

  ws.on('error', err => {
    logError('❌ Spot WS erro:', err.message);
    ws.close();
  });

  ws.on('close', () => {
    retrySpot++;
    const delay = Math.min(30000, 1000 * 2 ** retrySpot);
    logWarn(`🔄 Spot WS reconecta em ${delay/1000}s`);
    setTimeout(() => startSpotWS(batch), delay);
  });
}

export function setupSocketMonitor(io) {
  loadTrackedPairs()
    .then(async () => {
      await fetchSpotPrices();
      startFutureWS();
      const batches = chunkArray(trackedPairs, 30);
      batches.forEach(startSpotWS);
      logInfo(`🟢 Spot WS: ${batches.length} conexões iniciadas`);

      setInterval(fetchSpotPrices, 10000);

      setInterval(() => {
        trackedPairs.forEach(sym => {
          const s = Number(spotData[sym] ?? NaN);
          const f = Number(futureData[sym] ?? NaN);
          const sb = Number(spotReverseData[sym] ?? NaN);
          const fa = Number(futureReverseData[sym] ?? NaN);

          if (isNaN(s) || isNaN(f)) return;
          const lucro = (((f - s) / s) * 100).toFixed(2);

          const lucroReverso = (!isNaN(sb) && !isNaN(fa))
            ? (((sb - fa) / fa) * 100).toFixed(2)
            : null;

          const converged = Math.abs(f - s) < THRESHOLD;
          encontros[sym] = encontros[sym] ?? 0;
          lastConverged[sym] = lastConverged[sym] ?? false;
          if (converged && !lastConverged[sym]) encontros[sym]++;
          lastConverged[sym] = converged;

          io.emit('spotData', {
            symbol: sym,
            data: {
              spotPrice: s.toString(),
              futurePrice: f.toString(),
              lucro,
              encontros: encontros[sym],
              spotBid: !isNaN(sb) ? sb.toString() : null,
              futureAsk: !isNaN(fa) ? fa.toString() : null,
              lucroReverso
            }
          });
        });
      }, 1000);

      const ONE_HOUR = 60 * 60 * 1000;
      setInterval(() => {
        logInfo('🔄 Resetando encontros (última hora)');
        Object.keys(encontros).forEach(sym => { encontros[sym] = 0; lastConverged[sym] = false; });
      }, ONE_HOUR);

      logInfo('🟢 Monitor socket ativo');
    })
    .catch(err => logError('❌ Não foi possível iniciar monitor:', err));
}

router.get('/', authMiddleware, (_req, res) => res.status(200).json([]));

export default router;
