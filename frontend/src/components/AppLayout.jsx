import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout({ role }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  // The name always comes from the profile the backend loaded.
  const name = profile?.full_name?.trim() || profile?.email || 'Loading...';
  const subtitle = role === 'admin' ? 'Administrator' : 'Student';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        open={open}
        onNavigate={() => setOpen(false)}
        onSignOut={handleSignOut}
      />
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="app-main">
        <Topbar name={name} subtitle={subtitle} onMenu={() => setOpen(true)} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
