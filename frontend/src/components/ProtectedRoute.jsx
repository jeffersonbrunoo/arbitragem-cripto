import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token || token.split('.').length !== 3) {
    console.warn('Token inválido ou ausente');
    return <Navigate to="/login" replace />;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const payloadDecoded = JSON.parse(atob(payloadBase64));
    if (!payloadDecoded || !payloadDecoded.userId) throw new Error('Payload inválido');
    return children;
  } catch (err) {
    console.warn('Falha ao validar token JWT:', err);
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
