import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAV } from './navConfig';

export default function Sidebar({ role, open, onNavigate, onSignOut }) {
  return (
    <aside className={`sidebar-wrap${open ? ' open' : ''}`}>
      <div className="brand">LogiKeep</div>
      <nav className="sidebar" aria-label="Main navigation">
        {NAV[role].map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button type="button" className="side-link signout" onClick={onSignOut}>
          <LogOut size={20} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
}