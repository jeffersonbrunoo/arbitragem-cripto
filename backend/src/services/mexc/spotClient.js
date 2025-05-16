// backend/src/services/mexc/spotClient.js

import WebSocket from 'ws';
import axios from 'axios';
import Debug from 'debug';

const logInfo = Debug('spot:info');
const logWarn = Debug('spot:warn');
const logError = Debug('spot:error');

const SPOT_WS_URL = 'wss://wbs-api.mexc.com/ws';
const REST_BOOKTICKER_URL = 'https://api.mexc.com/api/v3/ticker/bookTicker';

export const spotData = {};
export const spotReverseData = {};

let retrySpot = 0;

export async function fetchSpotPrices() {
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

export function startSpotWS(batch) {
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
