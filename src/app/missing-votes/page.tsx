import { getDataManager, Submission } from '../../lib/data';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import MissingVotesTable from '../../components/MissingVotesTable';
import GlassCard from '../../components/ui/GlassCard';

export default async function MissingVotesPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();
  const votes = dataManager.getVotes();
  const competitors = dataManager.getCompetitors();

  // Group submissions by season and round
  const submissionsBySeason = new Map<number, Map<number, Submission[]>>();
  
  submissions.forEach(submission => {
    if (!submissionsBySeason.has(submission.season)) {
      submissionsBySeason.set(submission.season, new Map());
    }
    
    const seasonMap = submissionsBySeason.get(submission.season)!;
    if (!seasonMap.has(submission.roundNumber)) {
      seasonMap.set(submission.roundNumber, []);
    }
    
    seasonMap.get(submission.roundNumber)!.push(submission);
  });

  // Calculate participation for each round
  const participationData = new Map<string, {
    season: number;
    roundNumber: number;
    roundName: string;
    submissions: Submission[];
    voters: Set<string>;
    expectedVoters: Set<string>;
    missingVoters: string[];
    participationRate: number;
  }>();

  submissionsBySeason.forEach((roundsMap, season) => {
    roundsMap.forEach((roundSubmissions, roundNumber) => {
      const roundName = roundSubmissions[0]?.roundName || `Round ${roundNumber}`;
      const roundId = roundSubmissions[0]?.roundId;
      
      // Get all voters for this round
      const roundVotes = votes.filter(vote => vote.roundId === roundId);
      const voters = new Set(roundVotes.map(vote => vote.voterId));
      
      // Get all submitters for this round
      const submitters = new Set(roundSubmissions.map(sub => sub.submitterId));
      
      // Expected voters should be all submitters (they should vote on each other's submissions)
      const expectedVoters = new Set(submitters);
      const missingVoters = Array.from(expectedVoters).filter(voterId => !voters.has(voterId));
      
      const participationRate = expectedVoters.size > 0 ? 
        ((expectedVoters.size - missingVoters.length) / expectedVoters.size) * 100 : 100;
      
      participationData.set(`${season}-${roundNumber}`, {
        season,
        roundNumber,
        roundName,
        submissions: roundSubmissions,
        voters,
        expectedVoters,
        missingVoters,
        participationRate
      });
    });
  });

  // Calculate overall participation stats
  const overallStats = {
    totalRounds: participationData.size,
    averageParticipation: 0,
    roundsWithMissingVotes: 0,
    totalMissingVotes: 0
  };

  let totalParticipation = 0;
  participationData.forEach(data => {
    totalParticipation += data.participationRate;
    if (data.missingVoters.length > 0) {
      overallStats.roundsWithMissingVotes++;
      overallStats.totalMissingVotes += data.missingVoters.length;
    }
  });

  overallStats.averageParticipation = participationData.size > 0 ? 
    totalParticipation / participationData.size : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <GlassCard variant="elevated" size="lg">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Missing Votes
              </h1>
              <p className="text-gray-400">Track participation and missing votes across all rounds</p>
            </div>
          </GlassCard>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Rounds</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.totalRounds}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
            </GlassCard>

            <GlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Participation</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.averageParticipation.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </GlassCard>

            <GlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rounds with Missing</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.roundsWithMissingVotes}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </GlassCard>

            <GlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Missing Votes</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.totalMissingVotes}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </GlassCard>
          </div>

          {/* Participation by Season */}
          <GlassCard variant="elevated" size="lg">
            <MissingVotesTable participationData={participationData} competitors={competitors} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
