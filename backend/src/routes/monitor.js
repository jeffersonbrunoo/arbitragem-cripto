// backend/src/routes/monitor.js

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import axios from 'axios';
import Debug from 'debug';
import {
  startSpotWS,
  fetchSpotPrices,
  spotData,
  spotReverseData
} from '../services/mexc/spotClient.js';
import {
  startFutureWS,
  futureData,
  futureReverseData
} from '../services/mexc/futureClient.js';

const logInfo = Debug('monitor:info');
const logWarn = Debug('monitor:warn');
const logError = Debug('monitor:error');

const router = express.Router();

const REST_SYMBOLS_URL = 'https://api.mexc.com/api/v3/ticker/price';
const THRESHOLD = 0.0001;

let trackedPairs = [];
const encontros = {};
const lastConverged = {};
const BLACKLIST = ['MAGAUSDT', 'ALTUSDT', 'QIUSDT', 'JAGERUSDT', 'CATTONUSDT'];

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

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

export function setupSocketMonitor(io) {
  loadTrackedPairs()
    .then(async () => {
      await fetchSpotPrices();
      startFutureWS(trackedPairs);
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
