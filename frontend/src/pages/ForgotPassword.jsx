import { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function ForgotPassword() {
  const toast = useToast();
  const { sendResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await sendResetEmail(email.trim());
      if (error) {
        toast.error(error.message);
        return;
      }
      // Same message either way on purpose — never reveal who has an account.
      toast.success('If that email is registered, a reset link is on its way.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      panelSide="right"
      heading="Forgot your password?"
      text="Enter your email and we will send you a reset link."
      buttonLabel="Back to Login"
      buttonTo="/login"
    >
      <h1 className="auth-title">Reset Password</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-block" disabled={busy}>
          {busy ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
}
