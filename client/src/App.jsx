import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import Notes from './pages/Notes';
import QA from './pages/QA';
import SocialFeed from './pages/SocialFeed';
import Network from './pages/Network';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="resume" element={<ResumeBuilder />} />
            <Route path="resume/:id" element={<ResumeBuilder />} />
            <Route path="notes" element={<Notes />} />
            <Route path="qa" element={<QA />} />
            <Route path="feed" element={<SocialFeed />} />
            <Route path="network" element={<Network />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
