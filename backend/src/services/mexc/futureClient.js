// backend/src/services/mexc/futureClient.js

import WebSocket from 'ws';
import Debug from 'debug';

const logInfo = Debug('future:info');
const logWarn = Debug('future:warn');
const logError = Debug('future:error');

const FUTURE_WS_URL = 'wss://contract.mexc.com/edge';

export const futureData = {};
export const futureReverseData = {};

let retryFuture = 0;

export function startFutureWS(trackedPairs) {
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
    setTimeout(() => startFutureWS(trackedPairs), delay);
  });
}
