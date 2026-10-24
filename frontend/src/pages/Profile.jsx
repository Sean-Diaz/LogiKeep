import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

// The form is its own component and copies the profile into state once, on
// mount. The `key` on <ProfileForm> remounts it whenever the profile object
// becomes a new version, so saved edits show up without extra effects.
export default function Profile() {
  const { profile } = useAuth();
  if (!profile) return <Loader label="Loading your profile..." />;
  return <ProfileForm key={profile.id} profile={profile} />;
}

function ProfileForm({ profile }) {
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    username: profile.username ?? '',
    program: profile.program ?? '',
    year_section: profile.year_section ?? '',
    phone: profile.phone ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // The backend only lets a student change these; role and student_id are
      // protected by the API and by the database trigger.
      await api.patch('/profiles/me', {
        full_name: form.full_name,
        username: form.username,
        program: form.program,
        year_section: form.year_section,
        phone: form.phone,
      });
      await refreshProfile();
      toast.success('Profile updated.');
    } catch (err) {
      const message = err.response?.data?.message ?? 'Could not save your profile. Is the backend running?';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Your account details. Only names and contact info can be edited."
      />

      <section className="card section">
        <form onSubmit={handleSubmit} className="form">
          <div className="field-row">
            <div className="field">
              <label htmlFor="full_name">Full name</label>
              <input id="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Last name, First name" required />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" value={form.username} onChange={set('username')} placeholder="Username" required />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="student_id">Student ID</label>
              <input id="student_id" value={profile.student_id || '(not set)'} disabled readOnly />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={profile.email || ''} disabled readOnly />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="program">Program</label>
              <input id="program" value={form.program} onChange={set('program')} placeholder="e.g. BSIT" />
            </div>
            <div className="field">
              <label htmlFor="year_section">Year &amp; Section</label>
              <input id="year_section" value={form.year_section} onChange={set('year_section')} placeholder="e.g. 3B" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. 0917 123 4567" />
          </div>

          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </>
  );
}
