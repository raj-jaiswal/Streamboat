import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';
import useUiProtection from './hooks/useUiProtection'; // Import the new hook

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Library from './pages/Library';
import MyMedia from './pages/MyMedia';
import Upload from './pages/Upload';
import ClaimCopyright from './pages/ClaimCopyright';
import Profile from './pages/Profile';
import MediaDisplay from './pages/MediaDisplay';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // 1. Initialize the general UI protections (Right click, shortcuts, etc.)
  useUiProtection();

  // 2. The Debugger Trap (Hostile DevTools Blocker)
  useEffect(() => {
    const antiDevTools = setInterval(() => {
      Function("debugger")(); 
    }, 50);

    return () => clearInterval(antiDevTools);
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1c1c1f', color: '#fff', border: '1px solid #333' } }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Protected Routes (wrapped in Layout) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/library" element={<Library />} />
            <Route path="/stream" element={<Navigate to="/library" replace />} />
            <Route path="/myMedia" element={<MyMedia />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/claim" element={<ClaimCopyright />} />
            <Route path="/settings" element={<Profile />} />
            <Route path="/media/:id" element={<MediaDisplay />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;