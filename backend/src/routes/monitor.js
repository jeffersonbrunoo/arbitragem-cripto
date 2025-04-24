import express from 'express';
import axios from 'axios';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const BASE_SPOT_URL = 'https://api.mexc.com';
const BASE_CONTRACT_URL = 'https://contract.mexc.com/api/v1';

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: spotData } = await axios.get(`${BASE_SPOT_URL}/api/v3/ticker/bookTicker`);
    const usdtPairs = spotData.filter((pair) => pair.symbol.endsWith('USDT'));

    const results = await Promise.all(
      usdtPairs.slice(0, 10).map(async (pair) => {
        const { symbol, bidPrice, askPrice } = pair;
        const baseSymbol = symbol.replace('USDT', '');
        const futureSymbol = `${baseSymbol}_USDT`;

        let indexPrice = null;
        let fairPrice = null;

        try {
          const [indexRes, fairRes] = await Promise.all([
            axios.get(`${BASE_CONTRACT_URL}/contract/index_price/${futureSymbol}`),
            axios.get(`${BASE_CONTRACT_URL}/contract/fair_price/${futureSymbol}`)
          ]);

          indexPrice = indexRes.data.data.indexPrice;
          fairPrice = fairRes.data.data.fairPrice;
        } catch (err) {
          return null;
        }

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
      })
    );

    res.json(results.filter(Boolean));
  } catch (err) {
    console.error('Erro no /monitor:', err.message);
    res.status(500).json({ error: 'Erro ao consultar preços' });
  }
});

export default router;
