import { getDataManager } from '@/lib/data';
import SubmissionsTable from '@/components/SubmissionsTable';

export default async function SubmissionsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">All Submissions</h1>
        <p className="text-gray-400">All {submissions.length.toLocaleString()} submissions across all seasons</p>
      </div>

      <SubmissionsTable submissions={submissions} />
    </div>
  );
}
