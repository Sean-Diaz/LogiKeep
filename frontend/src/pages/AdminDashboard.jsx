import { useState } from 'react';
import { GitPullRequest, RotateCcw, Boxes, PackageOpen, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';

// SAMPLE DATA. Stage 9 replaces this with real numbers from the API.
const SAMPLE_ROWS = [
  { id: 1, name: 'Barabat, Sam', student_id: '12345', program: 'BSIT', item: 'Basketball Court', date: '10/22/26', due: '10/23/26', status: 'overdue' },
  { id: 2, name: 'Oliva, Nicole', student_id: '67890', program: 'BSIT', item: 'Volleyball Court', date: '10/24/26', due: '10/26/26', status: 'borrowed' },
  { id: 3, name: 'Dupa, Sean', student_id: '11121', program: 'BSIT', item: 'Badminton Court', date: '10/26/26', due: '10/27/26', status: 'approved' },
];

const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'student_id', header: 'ID' },
  { key: 'program', header: 'Program' },
  { key: 'item', header: 'Item' },
  { key: 'date', header: 'Date' },
  { key: 'due', header: 'Due' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function AdminDashboard() {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of borrowing activity (sample data)." />

      <div className="stat-grid">
        <StatCard wide label="Borrowed Item" value="12" hint="items borrowed" />
        <StatCard icon={GitPullRequest} value="3" label="Pending requests" />
        <StatCard icon={RotateCcw} value="2" label="Items returned" />
        <StatCard icon={Boxes} value="224" label="Total equipment" />
        <StatCard icon={PackageOpen} value="147" label="Available" />
        <StatCard icon={Clock} value="1" label="Overdue" />
      </div>

      <section className="card section">
        <h3>Currently borrowed</h3>
        <DataTable columns={COLUMNS} rows={SAMPLE_ROWS} />
      </section>

      {/* Temporary: lets you test the shared components. Removed in Stage 9. */}
      <section className="card section">
        <h3>Component check (temporary)</h3>
        <div className="btn-row">
          <button type="button" className="btn btn-sm" onClick={() => toast.success('Saved successfully.')}>Success toast</button>
          <button type="button" className="btn btn-sm" onClick={() => toast.error('Something went wrong.')}>Error toast</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialogOpen(true)}>Confirm dialog</button>
        </div>
      </section>

      <ConfirmDialog
        open={dialogOpen}
        title="Reject this request?"
        message="The student will be notified that the request was rejected."
        confirmLabel="Reject"
        danger
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          toast.success('Dialog confirmed.');
        }}
      />
    </>
  );
}