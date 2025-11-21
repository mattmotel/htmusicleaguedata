import { getDataManager, Submission } from '../../lib/data';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import MissingVotesTable from '../../components/MissingVotesTable';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';
import PageHeader from '../../components/ui/PageHeader';

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
    expectedSubmitters: Set<string>;
    actualSubmitters: Set<string>;
    expectedVoters: Set<string>;
    missingSubmitters: string[];
    missingVoters: string[];
    participationRate: number;
  }>();

  submissionsBySeason.forEach((roundsMap, season) => {
    // Get all active participants in this season (people who submitted in ANY round)
    const seasonSubmissions = Array.from(submissionsBySeason.get(season)?.values() || []).flat();
    const activeParticipants = new Set(seasonSubmissions.map(sub => sub.submitterId));
    
    roundsMap.forEach((roundSubmissions, roundNumber) => {
      const roundName = roundSubmissions[0]?.roundName || `Round ${roundNumber}`;
      const roundId = roundSubmissions[0]?.roundId;
      
      // Get all voters for this round
      const roundVotes = votes.filter(vote => vote.roundId === roundId);
      const voters = new Set(roundVotes.map(vote => vote.voterId));
      
      // Get all submitters for this round
      const actualSubmitters = new Set(roundSubmissions.map(sub => sub.submitterId));
      
      // Expected submitters should be all active participants in this season
      const expectedSubmitters = new Set(activeParticipants);
      const missingSubmitters = Array.from(expectedSubmitters).filter(submitterId => !actualSubmitters.has(submitterId));
      
      // Expected voters should be all submitters (they should vote on each other's submissions)
      const expectedVoters = new Set(actualSubmitters);
      const missingVoters = Array.from(expectedVoters).filter(voterId => !voters.has(voterId));
      
      // Participation rate based on both submissions and votes
      const totalExpected = expectedSubmitters.size + expectedVoters.size;
      const totalActual = actualSubmitters.size + voters.size;
      const participationRate = totalExpected > 0 ? 
        (totalActual / totalExpected) * 100 : 100;
      
      participationData.set(`${season}-${roundNumber}`, {
        season,
        roundNumber,
        roundName,
        submissions: roundSubmissions,
        voters,
        expectedSubmitters,
        actualSubmitters,
        expectedVoters,
        missingSubmitters,
        missingVoters,
        participationRate
      });
    });
  });

  // Calculate overall participation stats
  const overallStats = {
    totalRounds: participationData.size,
    averageParticipation: 0,
    roundsWithMissing: 0,
    totalMissingSubmissions: 0,
    totalMissingVotes: 0
  };

  let totalParticipation = 0;
  participationData.forEach(data => {
    totalParticipation += data.participationRate;
    if (data.missingSubmitters.length > 0 || data.missingVoters.length > 0) {
      overallStats.roundsWithMissing++;
      overallStats.totalMissingSubmissions += data.missingSubmitters.length;
      overallStats.totalMissingVotes += data.missingVoters.length;
    }
  });

  overallStats.averageParticipation = participationData.size > 0 ? 
    totalParticipation / participationData.size : 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-4 md:py-8">
        <div className="space-y-4 md:space-y-8">
          {/* Header */}
          <PageHeader
            title="Missing Votes"
            description="Track participation and missing votes across all rounds"
          />

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Rounds</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.totalRounds}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Participation</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.averageParticipation.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rounds with Missing</p>
                  <p className="text-2xl font-bold text-emerald-400">{overallStats.roundsWithMissing}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Missing Submissions</p>
                  <p className="text-2xl font-bold text-yellow-400">{overallStats.totalMissingSubmissions}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Missing Votes</p>
                  <p className="text-2xl font-bold text-orange-400">{overallStats.totalMissingVotes}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </SimpleGlassCard>
          </div>

          {/* Participation by Season */}
          <SimpleGlassCard variant="elevated" size="lg">
            <MissingVotesTable participationData={participationData} competitors={competitors} />
          </SimpleGlassCard>
        </div>
      </div>
    </div>
  );
}
