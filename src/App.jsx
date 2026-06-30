import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import Login from './Components/Login';
import DashboardLayout from './Components/DashboardLayout';
import Dashboard from './Components/Dashboard';
import InvoicesList from './Components/InvoicesList';
import CreateInvoice from './Components/CreateInvoice';
import ClientsList from './Components/ClientsList';

// Premium Loading Spinner Screen
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
    <div className="relative flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
      <div className="absolute w-10 h-10 border-4 border-emerald-500/20 border-b-emerald-400 rounded-full animate-spin duration-700"></div>
    </div>
    <p className="mt-4 text-slate-400 font-medium tracking-wide animate-pulse">Verifying Credentials...</p>
  </div>
);

// Protected Route Wrapper (Restricted to Authenticated Users)
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Wrapper (Prevents Logged In Users from viewing Login Page)
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Dashboard />} />
            <Route path="invoices" element={<InvoicesList />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
            <Route path="clients" element={<ClientsList />} />
          </Route>

          {/* Catch all and Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
