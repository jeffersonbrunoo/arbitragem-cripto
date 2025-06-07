import fs from 'fs';
import path from 'path';

export function salvarLogSimulacao(dados) {
  const pastaLogs = path.resolve('src', 'logs');
  if (!fs.existsSync(pastaLogs)) fs.mkdirSync(pastaLogs);

  const nomeArquivo = `simulacao-${Date.now()}.json`;
  const caminho = path.join(pastaLogs, nomeArquivo);

  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
  console.log(`📦 ${dados.length} operações simuladas salvas em: ${caminho}`);
}
