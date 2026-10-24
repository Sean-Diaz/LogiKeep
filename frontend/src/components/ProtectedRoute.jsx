import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

// Wrap protected pages. `role` is the only role allowed through;
// a logged-in user with the wrong role is sent to their own dashboard.
export default function ProtectedRoute({ role, children }) {
  const { session, profile, profileFailed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session..." />;

  if (!session) {
    // Remember where they were heading so Login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (profileFailed && !profile) {
    return (
      <div className="page">
        <section className="card section">
          <div className="section-head">
            <h2>Profile unavailable</h2>
          </div>
          <p className="muted">
            We signed you in, but could not load your profile. Make sure the backend is running
            (<code>npm run dev</code> inside <code>backend/</code>), then refresh this page.
          </p>
        </section>
      </div>
    );
  }

  if (!profile) return <Loader label="Loading your profile..." />;

  // The role ALWAYS comes from our database via the backend (GET /api/auth/me).
  if (role && profile.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return children;
}
