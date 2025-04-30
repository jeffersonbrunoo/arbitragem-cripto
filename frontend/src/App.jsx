import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import socket from './services/socket';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPage from './components/ForgotPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import DashboardPage from './components/DashboardPage';
import MePage from './components/MePage';
import ChangePasswordPage from './components/ChangePasswordPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  useEffect(() => {
    socket.connect();
    console.log('✅ Socket conectado ao backend');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/me"
          element={
            <PrivateRoute>
              <MePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePasswordPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
