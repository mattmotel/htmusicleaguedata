import { getDataManager } from '../../lib/data';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import SubmissionsTable from '../../components/SubmissionsTable';

export default async function SubmissionsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="All Submissions"
            description={`Browse ${submissions.length.toLocaleString()} song submissions across all seasons`}
          />

          {/* Submissions Table */}
          <GlassCard variant="elevated" size="lg">
            <SubmissionsTable submissions={submissions} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
