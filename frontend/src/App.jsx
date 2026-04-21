import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Library from './pages/Library';
import Upload from './pages/Upload';
import ClaimCopyright from './pages/ClaimCopyright';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />

      {/* Protected Routes (wrapped in Layout) */}
      <Route element={<Layout />}>
        <Route path="/library" element={<Library />} />
        <Route path="/stream" element={<Navigate to="/library" replace />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/claim" element={<ClaimCopyright />} />
        <Route path="/settings" element={<Profile />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
