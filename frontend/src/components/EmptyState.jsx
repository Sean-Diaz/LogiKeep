import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', text = '' }) {
  return (
    <div className="empty">
      <Inbox size={40} aria-hidden="true" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  );
}