export function checarRiscos(moeda) {
  const lucroEntrada = parseFloat(moeda.lucroEntrada);
  const lucroSaida = parseFloat(moeda.lucroSaida);
  const encontros = parseInt(moeda.encontros);

  return lucroEntrada > 0.2 && lucroSaida > 0.1 && encontros >= 1;
}
