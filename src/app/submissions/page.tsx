import { getDataManager } from '../../lib/data';
import { motion } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import SubmissionsTable from '../../components/SubmissionsTable';

export default async function SubmissionsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
              All Submissions
            </h1>
            <p className="text-lg text-slate-300">
              Browse {submissions.length.toLocaleString()} song submissions across all seasons
            </p>
          </div>

          {/* Submissions Table */}
          <GlassCard variant="elevated" size="lg">
            <SubmissionsTable submissions={submissions} />
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
