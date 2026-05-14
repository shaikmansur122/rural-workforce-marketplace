import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkerDashboard from './pages/WorkerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import WorkerProfilePage from './pages/WorkerProfilePage';
import ProviderProfilePage from './pages/ProviderProfilePage';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
      <a href="/" className="btn-primary inline-flex">Go Home</a>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastClassName="!rounded-xl !shadow-premium !font-sans !text-sm"
        />
        <Routes>
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/worker"       element={<ProtectedRoute role="WORKER"><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/provider"     element={<ProtectedRoute role="PROVIDER"><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/workers/:id"  element={<WorkerProfilePage />} />
          <Route path="/providers/:id" element={<ProviderProfilePage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
