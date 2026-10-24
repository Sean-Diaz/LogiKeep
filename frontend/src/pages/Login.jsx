import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

// Friendly text for the usual Supabase error instead of its raw message.
function friendly(message) {
  if (message.includes('Invalid login credentials')) return 'Wrong email or password.';
  if (message.includes('Email not confirmed')) return 'Please confirm your email first — check your inbox.';
  return message;
}

export default function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error, profile } = await signIn(email.trim(), password);
      if (error) {
        toast.error(friendly(error.message));
        return;
      }
      // If the user was bounced here from a protected page, go back there.
      // Otherwise land on the dashboard that matches their role from the database.
      const from = location.state?.from;
      navigate(from || (profile?.role === 'admin' ? '/admin' : '/student'), { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      panelSide="right"
      heading="Hello! Welcome back"
      text="New here? Create an account to start borrowing."
      buttonLabel="Register"
      buttonTo="/register"
    >
      <h1 className="auth-title">Log In</h1>
      <p className="center">Sign in with Email &amp; Password</p>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter E-mail"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link className="center" to="/forgot-password">Forgot Password?</Link>
        <button type="submit" className="btn btn-block" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}
