// backend/src/services/gateio/spotGateioClient.js

import axios from 'axios';
import Debug from 'debug';

const logInfo = Debug('gateio:info');
const logError = Debug('gateio:error');

const REST_GATEIO_TICKER_URL = 'https://api.gate.io/api/v4/spot/tickers';

export const gateioAskData = {};     // Melhor preço de venda (vermelho)
export const gateioBidData = {};     // Melhor preço de compra (verde)

export async function fetchGateioSpotPrices() {
  try {
    const start = Date.now();
    const { data } = await axios.get(REST_GATEIO_TICKER_URL);

    if (!Array.isArray(data)) {
      logError('❌ Resposta inesperada da Gate.io');
      return;
    }

    data.forEach(item => {
      if (item.currency_pair.endsWith('_usdt')) {
        const symbol = item.currency_pair.replace('_', '').toUpperCase(); // Ex: btc_usdt → BTCUSDT
        gateioAskData[symbol] = item.lowest_ask; // vermelho: você paga esse valor
        gateioBidData[symbol] = item.highest_bid; // verde: você vende por esse valor
      }
    });

    const duration = Date.now() - start;
    logInfo(`✅ Gate.io REST atualizado com ${Object.keys(gateioAskData).length} pares em ${duration}ms`);
  } catch (err) {
    logError('❌ Erro ao buscar dados da Gate.io:', err.message);
  }
}
