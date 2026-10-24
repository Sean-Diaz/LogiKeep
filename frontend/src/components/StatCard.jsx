export default function StatCard({ icon: Icon, label, value, hint, wide = false }) {
  if (wide) {
    return (
      <div className="stat-card wide">
        <h2 className="stat-title">{label}</h2>
        <p>{value} {hint}</p>
      </div>
    );
  }
  return (
    <div className="stat-card">
      {Icon && <Icon size={34} aria-hidden="true" />}
      <strong className="stat-value">{value}</strong>
      <span>{label}</span>
    </div>
  );
}