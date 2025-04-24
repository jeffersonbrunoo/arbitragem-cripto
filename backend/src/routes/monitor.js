import express from 'express';
import axios from 'axios';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const BASE_SPOT_URL = 'https://api.mexc.com';
const BASE_CONTRACT_URL = 'https://contract.mexc.com/api/v1';

// Cache de contratos válidos (RAM)
let contratosValidosCache = null;
let contratosTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 60 segundos

// Fallback padrão (8 moedas populares)
const contratosFallback = new Set([
  'BTC_USDT', 'ETH_USDT', 'XRP_USDT', 'DOGE_USDT',
  'SOL_USDT', 'LTC_USDT', 'TRX_USDT', 'MATIC_USDT'
]);

async function getContratosValidos() {
  const agora = Date.now();

  if (contratosValidosCache && (agora - contratosTimestamp < CACHE_TTL)) {
    return contratosValidosCache;
  }

  try {
    const { data } = await axios.get(`${BASE_CONTRACT_URL}/contract/detail`);
    contratosValidosCache = new Set(data.data.map(c => c.symbol));
    contratosTimestamp = agora;
    console.log(`✅ Contratos válidos atualizados (${contratosValidosCache.size})`);
    return contratosValidosCache;
  } catch (err) {
    console.warn('⚠️ Erro ao buscar contratos válidos, usando fallback');
    contratosValidosCache = contratosFallback;
    contratosTimestamp = agora;
    return contratosFallback;
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: spotData } = await axios.get(`${BASE_SPOT_URL}/api/v3/ticker/bookTicker`);
    const contratosValidos = await getContratosValidos();

    const usdtPairs = spotData
      .filter(pair => pair.symbol.endsWith('USDT'))
      .filter(pair => contratosValidos.has(`${pair.symbol.replace('USDT', '')}_USDT`))
      .slice(0, 20);

    const results = await Promise.all(
      usdtPairs.map(async (pair) => {
        const { symbol, bidPrice, askPrice } = pair;
        const baseSymbol = symbol.replace('USDT', '');
        const futureSymbol = `${baseSymbol}_USDT`;

        try {
          const [indexRes, fairRes] = await Promise.all([
            axios.get(`${BASE_CONTRACT_URL}/contract/index_price/${futureSymbol}`),
            axios.get(`${BASE_CONTRACT_URL}/contract/fair_price/${futureSymbol}`)
          ]);

          const indexPrice = indexRes.data.data.indexPrice;
          const fairPrice = fairRes.data.data.fairPrice;
          const spotAvg = (parseFloat(bidPrice) + parseFloat(askPrice)) / 2;
          const spreadIndex = ((indexPrice - spotAvg) / spotAvg) * 100;
          const spreadFair = ((fairPrice - spotAvg) / spotAvg) * 100;

          return {
            symbol,
            bidPrice: parseFloat(bidPrice),
            askPrice: parseFloat(askPrice),
            spotAverage: spotAvg,
            indexPrice,
            fairPrice,
            spreadIndex: spreadIndex.toFixed(2),
            spreadFair: spreadFair.toFixed(2)
          };
        } catch {
          return null;
        }
      })
    );

    const filtrados = results.filter(Boolean);
    console.log(`✅ /monitor retornando ${filtrados.length} pares válidos`);
    res.json(filtrados);
  } catch (err) {
    console.error('❌ Erro no /monitor:', err.message);
    res.status(500).json({ error: 'Erro ao consultar preços' });
  }
});

export default router;
