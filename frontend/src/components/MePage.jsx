import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function MePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/me');
        setEmail(data.email);
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

  if (loading) return <div className="text-center mt-5">Carregando...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h3 className="mb-4 text-center">Meu Perfil</h3>

      <div className="card p-4">
        <p><strong>Email:</strong> {email}</p>

        <Link to="/change-password" className="btn btn-primary mt-4">
          🔒 Trocar minha senha
        </Link>
      </div>
    </div>
  );
}

export default MePage;
