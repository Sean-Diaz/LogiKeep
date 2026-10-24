import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function PlaceholderPage({ title, stage }) {
  return (
    <>
      <PageHeader title={title} subtitle={`This page is built in Stage ${stage}.`} />
      <div className="card">
        <EmptyState title="Coming up" text="The layout is ready. The real content arrives in a later stage." />
      </div>
    </>
  );
}