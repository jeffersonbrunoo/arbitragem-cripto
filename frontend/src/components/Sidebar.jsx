function Sidebar({
  lucroMinimo,
  setLucroMinimo,
  symbolFiltro,
  setSymbolFiltro,
  intervalo,
  setIntervalo,
  darkMode,
  toggleDark
}) {
  return (
    <div className={`p-3 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`} style={{ minWidth: 260, height: '100vh' }}>
      <h5>🔍 Filtros</h5>

      <input
        type="number"
        className="form-control mb-2"
        placeholder="Lucro mínimo (%)"
        value={lucroMinimo}
        onChange={(e) => setLucroMinimo(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Par (ex: BTC)"
        value={symbolFiltro}
        onChange={(e) => setSymbolFiltro(e.target.value)}
      />

      <select
        className="form-select mb-3"
        value={intervalo}
        onChange={(e) => setIntervalo(Number(e.target.value))}
      >
        <option value={1}>Atualizar a cada 1s</option>
        <option value={10}>Atualizar a cada 10s</option>
        <option value={30}>Atualizar a cada 30s</option>
        <option value={60}>Atualizar a cada 60s</option>
      </select>

      <button className={`btn w-100 ${darkMode ? 'btn-light' : 'btn-dark'}`} onClick={toggleDark}>
        {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
      </button>
    </div>
  );
}

export default Sidebar;
