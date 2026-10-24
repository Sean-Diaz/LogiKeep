import { Link } from 'react-router-dom';
import { Package, ArrowRight, User, Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Calendar from '../components/Calendar';

// SAMPLE DATA. Stage 7 replaces this with the student's real records.
const EQUIPMENT = [
  { id: 1, name: 'Chair', available: 112 },
  { id: 2, name: 'Table', available: 34 },
  { id: 3, name: 'Volleyball Net', available: 1 },
];
const REQUESTS = [
  { id: 1, label: 'Chair x 2', date: '10/25/26', status: 'pending' },
  { id: 2, label: 'Table x 1', date: '10/24/26', status: 'approved' },
  { id: 3, label: 'Volleyball Court', date: '10/20/26', status: 'returned' },
];
const BORROWED = [
  { id: 1, label: 'Volleyball Net', due: 'Due 10/26/26' },
  { id: 2, label: 'Chair x 4', due: 'Due 10/27/26' },
];

export default function StudentDashboard() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your equipment requests at a glance (sample data)." />

      <div className="dash-grid">
        <div>
          <section className="card section">
            <h2>Equipments</h2>
            <div className="equip-grid">
              {EQUIPMENT.map((item) => (
                <article key={item.id} className="equip-card">
                  <div className="equip-img"><Package size={40} aria-hidden="true" /></div>
                  <h3>{item.name}</h3>
                  <p className="muted">{item.available} available</p>
                  <Link className="request-link" to="/student/request/new">
                    Request <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="card section">
            <div className="section-head">
              <h2>My Request</h2>
              <Link to="/student/requests">See All</Link>
            </div>
            <ul className="list">
              {REQUESTS.map((r) => (
                <li key={r.id}>
                  <span>{r.label}</span>
                  <span className="muted">{r.date}</span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="dash-aside">
          <section className="card">
            <div className="section-head">
              <h3>Profile</h3>
              <Link to="/student/profile" aria-label="Edit profile"><Pencil size={18} /></Link>
            </div>
            <div className="profile-box">
              <span className="avatar big"><User size={36} aria-hidden="true" /></span>
              <strong>Student User</strong>
            </div>
          </section>

          <section className="card">
            <Calendar />
          </section>

          <section className="card">
            <div className="section-head">
              <h3>Borrowed Items</h3>
              <Link to="/student/history">View All</Link>
            </div>
            <ul className="list compact">
              {BORROWED.map((b) => (
                <li key={b.id}>
                  <span>{b.label}</span>
                  <span className="muted">{b.due}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}