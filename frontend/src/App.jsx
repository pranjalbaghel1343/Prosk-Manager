import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import PrankPage from './pages/PrankPage';
import './index.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('prosk_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('prosk_token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prank"
            element={
              <ProtectedRoute>
                <PrankPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
