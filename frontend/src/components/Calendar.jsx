const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Calendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const title = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar" aria-label={title}>
      <h3>{title}</h3>
      <div className="cal-grid">
        {DAYS.map((d, i) => (
          <span key={d} className={`cal-head${i === 0 ? ' sun' : ''}`}>{d}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`cal-day${day === today.getDate() ? ' today' : ''}${i % 7 === 0 ? ' sun' : ''}`}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}