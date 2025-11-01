import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './app/Login/Login';
import Dashboard from './app/Dashboard/Dashboard';
import LiveMonitoring from './app/LiveMonitoring/LiveMonitoring';
import NetworkTraffic from './app/NetworkTraffic/NetworkTraffic';
import AIAnalytics from './app/AIAnalytics/AIAnalytics';
import Incidents from './app/Incidents/Incidents';
import Settings from './app/Settings/Settings';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/live-monitoring" 
          element={
            <ProtectedRoute>
              <LiveMonitoring />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/network-traffic" 
          element={
            <ProtectedRoute>
              <NetworkTraffic />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-analytics" 
          element={
            <ProtectedRoute>
              <AIAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/incidents" 
          element={
            <ProtectedRoute>
              <Incidents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
