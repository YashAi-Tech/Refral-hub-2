import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { ReferralHandler } from './components/ReferralHandler';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Referral Link Handler */}
      <Route path="/r/:code" element={<ReferralHandler />} />
      
      {/* Root Path Handler (fallback if someone visits without /r/) */}
      <Route path="/:code" element={<ReferralHandler />} />

      {/* Main App Routes */}
      <Route 
        path="/" 
        element={user ? <Dashboard /> : <Landing />} 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
