import { getDataManager } from '../../lib/data';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';
import PageHeader from '../../components/ui/PageHeader';
import SubmissionsTable from '../../components/SubmissionsTable';

export default async function SubmissionsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-4 md:py-8">
        <div className="space-y-4 md:space-y-8">
          {/* Header */}
          <PageHeader
            title="All Submissions"
            description={`Browse ${submissions.length.toLocaleString()} song submissions across all seasons`}
          />

          {/* Submissions Table */}
          <SimpleGlassCard variant="elevated" size="lg">
            <SubmissionsTable submissions={submissions} />
          </SimpleGlassCard>
        </div>
      </div>
    </div>
  );
}
