import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function MePage() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    setToken(saved);
    if (saved) {
      try {
        const parsed = jwtDecode(saved);
        setDecoded(parsed);
      } catch {
        setDecoded(null);
      }
    }
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Token do Usuário</h3>

      {!token && (
        <div className="alert alert-warning">
          Nenhum token encontrado no localStorage.
        </div>
      )}

      {token && (
        <>
          <p><strong>Token JWT:</strong></p>
          <pre className="bg-light p-3 rounded" style={{ overflowX: 'auto' }}>
            {token}
          </pre>

          {decoded && (
            <>
              <h5 className="mt-4">Payload decodificado:</h5>
              <pre className="bg-secondary text-white p-3 rounded">
                {JSON.stringify(decoded, null, 2)}
              </pre>
            </>
          )}
        </>
      )}

      <div className="mt-4">
        <Link to="/dashboard" className="btn btn-outline-primary">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

export default MePage;
