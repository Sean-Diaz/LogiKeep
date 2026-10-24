import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

// Wrap Login / Register / etc. A logged-in user never sees these pages —
// they are sent straight to their own dashboard.
export default function PublicOnlyRoute({ children }) {
  const { session, profile, recovery, loading } = useAuth();

  if (loading) return <Loader label="Checking your session..." />;

  // In recovery mode the user holds a temporary session from the reset link —
  // they must be allowed to stay on /reset-password.
  if (!recovery && session && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return children;
}
