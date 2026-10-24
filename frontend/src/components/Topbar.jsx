import { useState } from 'react';
import { Menu, User } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Topbar({ name, subtitle, onMenu }) {
  const [query, setQuery] = useState('');

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <SearchBar value={query} onChange={setQuery} placeholder="Search..." />
      <div className="user-chip">
        <span className="avatar"><User size={18} aria-hidden="true" /></span>
        <span className="user-text">
          <strong>{name}</strong>
          <small>{subtitle}</small>
        </span>
      </div>
    </header>
  );
}