import { Link } from 'react-router-dom';
import { Cog, ClipboardList, Activity, PackageOpen, RotateCcw } from 'lucide-react';

const STEPS = [
  { icon: ClipboardList, title: 'Manage', text: 'Keep equipment and facilities organized in one inventory.' },
  { icon: Activity, title: 'Monitor', text: 'See what is available, borrowed, or overdue at any time.' },
  { icon: PackageOpen, title: 'Borrow', text: 'Students request items online and follow the approval status.' },
  { icon: RotateCcw, title: 'Return', text: 'Admins record returns so stock is always accurate.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="public-nav">
        <Link to="/" className="logo">LogiKeep</Link>
        <nav aria-label="Public navigation">
          <a href="#how">About</a>
          <a href="#contact">Contact</a>
          <Link className="pill pill-light" to="/login">Login</Link>
          <Link className="pill pill-dark" to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero">
        <Cog className="gear g1" aria-hidden="true" />
        <Cog className="gear g2" aria-hidden="true" />
        <Cog className="gear g3" aria-hidden="true" />
        <Cog className="gear g4" aria-hidden="true" />
        <div className="hero-inner">
          <h1>Borrow and track your equipment</h1>
          <p>LogiKeep lets you manage borrowed items and see the status of returned items.</p>
          <Link className="btn" to="/register">Get started</Link>
        </div>
      </section>

      <section id="how" className="how">
        <h2>How it works</h2>
        <p className="tagline">Manage. Monitor. Borrow. Return.</p>
        <p className="how-text">
          LogiKeep makes equipment management simple and organized. From checking equipment
          availability to tracking borrowing records, everything can be managed in one convenient system.
        </p>
      </section>

      <section className="steps" aria-label="Steps">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <article key={title} className="step-card">
            <Icon size={36} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <footer id="contact" className="landing-footer">
        <h2>Contact</h2>
        {/* Replace with your school's real contact details. */}
        <p>Marvin C Banihit</p>
        <p>MarvinBanihit@gmail.com</p>
      </footer>
    </div>
  );
}