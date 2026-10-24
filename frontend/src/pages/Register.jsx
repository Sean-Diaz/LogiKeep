import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    student_id: '',
    username: '',
    program: '',
    year_section: '',
    email: '',
    password: '',
  });
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // New users always start as role = student. The database trigger
  // (handle_new_user) copies these metadata fields into the profiles row.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      const { error, needsConfirmation } = await signUp(form);
      if (error) {
        // e.g. a duplicate Student ID makes the profile trigger fail.
        toast.error(error.message);
        return;
      }
      if (needsConfirmation) {
        toast.info('Account created! Check your email to confirm, then log in.');
        navigate('/login', { replace: true });
        return;
      }
      toast.success(`Welcome, ${form.full_name}!`);
      navigate('/student', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      panelSide="left"
      heading="Welcome to LogiKeep!"
      text="Already have an account? Sign in with your email and password."
      buttonLabel="Sign In"
      buttonTo="/login"
    >
      <h1 className="auth-title">Create an Account</h1>
      <p className="center">Register with E-mail</p>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" placeholder="Last name, First name" required value={form.full_name} onChange={set('full_name')} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="student_id">Student ID</label>
            <input id="student_id" placeholder="e.g. 395010" required value={form.student_id} onChange={set('student_id')} />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" placeholder="Username" required value={form.username} onChange={set('username')} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="program">Program</label>
            <input id="program" placeholder="e.g. BSIT" required value={form.program} onChange={set('program')} />
          </div>
          <div className="field">
            <label htmlFor="year_section">Year &amp; Section</label>
            <input id="year_section" placeholder="e.g. 3B" required value={form.year_section} onChange={set('year_section')} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="Enter E-mail" required autoComplete="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            minLength={8}
            required
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
          />
        </div>
        <button type="submit" className="btn btn-block" disabled={busy}>
          {busy ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
