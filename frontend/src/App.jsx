import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import socket from './services/socket';

// CSS global e Bootstrap (para classes existentes)
import { ThemeProvider } from './contexts/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPage from './pages/ForgotPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MePage from './pages/MePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  // Conecta o socket uma vez ao carregar a App
  useEffect(() => {
    socket.connect();
    console.log('✅ Socket conectado ao backend');
  }, []);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
