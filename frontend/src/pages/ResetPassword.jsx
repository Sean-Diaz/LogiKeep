import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function ResetPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const { recovery, loading, updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader label="Checking your session..." />;

  // This page only makes sense if the user arrived from a recovery email link.
  if (!recovery) {
    return (
      <AuthLayout
        panelSide="left"
        heading="Almost done"
        text="Choose a new password for your account."
        buttonLabel="Back to Login"
        buttonTo="/login"
      >
        <h1 className="auth-title">New Password</h1>
        <p className="center muted">
          This password-reset link looks invalid or expired. Request a fresh one from the{' '}
          <Link to="/forgot-password">forgot password page</Link>.
        </p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('The two passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Password updated! Please sign in with your new password.');
      // Sign out of the temporary recovery session, then log in normally.
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      panelSide="left"
      heading="Almost done"
      text="Choose a new password for your account."
      buttonLabel="Back to Login"
      buttonTo="/login"
    >
      <h1 className="auth-title">New Password</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            minLength={8}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            minLength={8}
            placeholder="Repeat password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-block" disabled={busy}>
          {busy ? 'Saving...' : 'Save Password'}
        </button>
      </form>
    </AuthLayout>
  );
}
