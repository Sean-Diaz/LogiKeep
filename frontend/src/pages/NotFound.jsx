import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="notfound">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn" to="/">Go home</Link>
    </main>
  );
}