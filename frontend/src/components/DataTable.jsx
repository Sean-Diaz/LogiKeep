import Loader from './Loader';
import EmptyState from './EmptyState';

// columns: [{ key, header, render?: (row) => JSX }]
export default function DataTable({
  columns,
  rows,
  loading = false,
  rowKey = 'id',
  emptyTitle = 'Nothing here yet',
  emptyText = '',
}) {
  if (loading) return <Loader />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} text={emptyText} />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}