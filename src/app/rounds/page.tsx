import { getDataManager } from '../../lib/data';
import { Lightbulb } from 'lucide-react';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import RoundIdeaGenerator from './RoundIdeaGenerator';
import RoundsList from './RoundsList';

export default async function RoundsPage() {
  const dataManager = await getDataManager();
  const roundsMap = dataManager.getRounds();
  const submissions = dataManager.getSubmissions();
  
  // Convert rounds map to array and add season info
  const roundsArray = Array.from(roundsMap.values()).map(round => {
    // Find which season this round belongs to
    const roundSubmissions = submissions.filter(s => s.roundId === round.id);
    const season = roundSubmissions[0]?.season || 0;
    return { ...round, season };
  });
  
  // Sort by timestamp (newest first)
  const sortedRounds = roundsArray.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Group by season
  const roundsBySeason = new Map<number, typeof sortedRounds>();
  sortedRounds.forEach(round => {
    if (!roundsBySeason.has(round.season)) {
      roundsBySeason.set(round.season, []);
    }
    roundsBySeason.get(round.season)!.push(round);
  });
  
  // Sort seasons descending
  const sortedSeasons = Array.from(roundsBySeason.keys()).sort((a, b) => b - a);
  
  // Prepare round descriptions for the AI generator
  const roundDescriptions = sortedRounds
    .filter(r => r.title && r.description)
    .map(r => `${r.title}: ${r.description}`)
    .join('\n');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="All Rounds"
            description={`Every theme we've explored across ${sortedSeasons.length} seasons and ${sortedRounds.length} rounds`}
          />

          {/* Rounds by Season */}
          <GlassCard variant="elevated" size="lg">
            <RoundsList 
              sortedSeasons={sortedSeasons}
              roundsBySeason={roundsBySeason}
            />
          </GlassCard>

          {/* AI Round Idea Generator */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Lightbulb className="h-8 w-8 text-yellow-400 mr-4" />
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Round Idea Generator
                </h2>
                <p className="text-gray-400 mt-2">
                  Generate suggestions for new round themes based on our history
                </p>
              </div>
            </div>
            
            <RoundIdeaGenerator existingRounds={roundDescriptions} />
          </SimpleGlassCard>
        </div>
      </div>
    </div>
  );
}

