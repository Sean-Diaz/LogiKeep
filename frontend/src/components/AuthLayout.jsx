import { Link } from 'react-router-dom';

// panelSide: 'left' puts the blue panel first (Register), 'right' puts it last (Login).
export default function AuthLayout({ panelSide = 'left', heading, text, buttonLabel, buttonTo, children }) {
  const panel = (
    <section className="auth-panel">
      <h1 className="auth-panel-title">{heading}</h1>
      <p>{text}</p>
      <Link className="btn" to={buttonTo}>{buttonLabel}</Link>
    </section>
  );
  const form = <section className="auth-form">{children}</section>;

  return (
    <div className="auth">
      {panelSide === 'left' ? <>{panel}{form}</> : <>{form}{panel}</>}
    </div>
  );
}