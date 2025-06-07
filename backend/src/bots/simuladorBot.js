import { checarRiscos } from '../utils/risco.js';
import { salvarLogSimulacao } from '../utils/logger.js';

export function simularArbitragem(dadosMonitorados) {
  const operacoesSimuladas = [];

  dadosMonitorados.forEach((moeda) => {
    const podeOperar = checarRiscos(moeda);

    if (podeOperar) {
      console.log(`🟢 Simulando arbitragem em ${moeda.symbol}`);

      operacoesSimuladas.push({
        par: moeda.symbol,
        spot: moeda.spot,
        future: moeda.future,
        lucroEntrada: moeda.lucroEntrada,
        lucroSaida: moeda.lucroSaida,
        encontros: moeda.encontros,
        data: new Date().toISOString()
      });
    }
  });

  if (operacoesSimuladas.length > 0) {
    salvarLogSimulacao(operacoesSimuladas);
  } else {
    console.log('⚠️ Nenhuma operação simulada nesta rodada.');
  }
}
