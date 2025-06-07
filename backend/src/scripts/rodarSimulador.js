import { simularArbitragem } from '../bots/simuladorBot.js';
import axios from 'axios';

// Token gerado via curl
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODM2ZmFjM2I1MTc4MGM5OWE5YTcwMDQiLCJpYXQiOjE3NDg4NjYwODUsImV4cCI6MTc0ODk1MjQ4NX0.6RMw39xHCOq8Mafp_RyN093ekzy17DSNuoMzkKVuWpo';

async function main() {
  try {
    const { data } = await axios.get('http://backend:5000/api/monitor', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('📦 Dados recebidos:', data);
    simularArbitragem(data);
  } catch (err) {
    console.error('❌ Erro ao buscar dados do monitor:', err.message);
  }
}

main();
