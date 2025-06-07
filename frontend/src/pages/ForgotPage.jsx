import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ForgotPage() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!email.includes('@')) {
      setErro('E-mail inválido');
      return;
    }

    try {
      await api.post('/auth/forgot', { email });
      setMensagem('Se o e-mail estiver cadastrado, um link foi enviado para redefinição.');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao solicitar redefinição.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">Recuperar Senha</h3>

      {mensagem && <div className="alert alert-success text-center">{mensagem}</div>}
      {erro && <div className="alert alert-danger text-center">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className={`form-control mb-3 ${erro ? 'is-invalid' : ''}`}
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {erro && <div className="invalid-feedback">{erro}</div>}

        <button type="submit" className="btn btn-primary w-100">Enviar Link</button>
      </form>

      <div className="text-center mt-3">
        <Link to="/login">Voltar ao login</Link>
      </div>
    </div>
  );
}

export default ForgotPage;
