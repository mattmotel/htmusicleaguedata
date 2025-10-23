import { getDataManager } from '../../lib/data';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';
import { Users, Calendar, TrendingUp, Award } from 'lucide-react';

export default async function SeasonsPage() {
  const dataManager = await getDataManager();
  
  // Get all data
  const submissions = dataManager.getSubmissions();
  const votes = dataManager.getVotes();
  const competitors = dataManager.getCompetitors();
  const roundsMap = dataManager.getRounds();
  const rounds = Array.from(roundsMap.values());

  // Calculate season statistics
  const seasonStats = new Map<number, {
    season: number;
    participants: Set<string>;
    submissions: number;
    votes: number;
    totalPoints: number;
    rounds: number;
    avgVotesPerSubmission: number;
    avgPointsPerVote: number;
    topSubmitter: { name: string; submissions: number; points: number };
    votingSystem: {
      votesPerUser: number;
      sampleRound: string;
      sampleRoundVotes: number;
      usersWhoVoted: number;
    };
  }>();

  // Get all unique seasons
  const allSeasons = Array.from(new Set(submissions.map(s => s.season))).sort((a, b) => a - b);

  allSeasons.forEach(season => {
    const seasonSubmissions = submissions.filter(s => s.season === season);
    const seasonVotes = votes.filter(v => v.season === season);
    const seasonRoundIds = new Set(seasonSubmissions.map(s => s.roundId));
    const seasonRounds = rounds.filter(r => seasonRoundIds.has(r.id));
    
    // Get unique participants (submitters)
    const participants = new Set(seasonSubmissions.map(s => s.submitterId));
    
    // Calculate total points
    const totalPoints = seasonVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    
    // Find top submitter(s) for this season
    const submitterStats = new Map<string, { name: string; submissions: number; points: number }>();
    seasonSubmissions.forEach(submission => {
      const submissionVotes = seasonVotes.filter(v => v.spotifyUri === submission.spotifyUri);
      const points = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
      
      if (!submitterStats.has(submission.submitterId)) {
        submitterStats.set(submission.submitterId, {
          name: submission.submitterName,
          submissions: 0,
          points: 0
        });
      }
      
      const stats = submitterStats.get(submission.submitterId)!;
      stats.submissions += 1;
      stats.points += points;
    });
    
    // Get all submitters sorted by points
    const sortedSubmitters = Array.from(submitterStats.values())
      .sort((a, b) => b.points - a.points);
    
    // Find all winners (those tied for first place)
    const topPoints = sortedSubmitters[0]?.points || 0;
    const winners = sortedSubmitters.filter(s => s.points === topPoints);
    
    const topSubmitter = winners.length > 1 
      ? { name: winners.map(w => w.name).join(' & '), submissions: winners[0]?.submissions || 0, points: topPoints }
      : sortedSubmitters[0] || { name: 'N/A', submissions: 0, points: 0 };
    
    // Analyze voting system for this season
    // Find the first round chronologically (earliest timestamp)
    const firstRound = seasonRounds.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    let votesPerUser = 0;
    let sampleRoundVotes = 0;
    let usersWhoVoted = 0;
    
    if (firstRound) {
      const firstRoundVotesList = seasonVotes.filter(v => v.roundId === firstRound.id);
      sampleRoundVotes = firstRoundVotesList.length;
      
      // Find Matt's actual voter ID by looking up his name in competitors
      let mattVoterId = '';
      for (const [voterId, voterName] of competitors.entries()) {
        if (voterName === 'Matt McInerney') {
          mattVoterId = voterId;
          break;
        }
      }
      
      // Count total points Matt assigned in the first round
      votesPerUser = mattVoterId ? firstRoundVotesList.filter(v => v.voterId === mattVoterId).reduce((sum, vote) => sum + vote.pointsAssigned, 0) : 0;
      
      // Count unique voters in this round
      const uniqueVoters = new Set(firstRoundVotesList.map(v => v.voterId));
      usersWhoVoted = uniqueVoters.size;
    }
    
    seasonStats.set(season, {
      season,
      participants,
      submissions: seasonSubmissions.length,
      votes: seasonVotes.length,
      totalPoints,
      rounds: seasonRounds.length,
      avgVotesPerSubmission: seasonSubmissions.length > 0 ? seasonVotes.length / seasonSubmissions.length : 0,
      avgPointsPerVote: seasonVotes.length > 0 ? totalPoints / seasonVotes.length : 0,
      topSubmitter,
      votingSystem: {
        votesPerUser,
        sampleRound: firstRound?.title || 'N/A',
        sampleRoundVotes,
        usersWhoVoted
      }
    });
  });

  const sortedSeasons = Array.from(seasonStats.values())
    .sort((a, b) => b.season - a.season);

  // Calculate overall stats
  const totalParticipants = competitors.size;
  const totalSeasons = allSeasons.length;
  const totalSubmissions = submissions.length;
  const totalVotes = votes.length;
  const totalPoints = votes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Season Statistics</h1>
          <p className="text-gray-400">Detailed breakdown of each season&apos;s performance</p>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <SimpleGlassCard variant="elevated" size="sm">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalSeasons}</p>
              <p className="text-sm text-gray-400">Total Seasons</p>
            </div>
          </SimpleGlassCard>

          <SimpleGlassCard variant="elevated" size="sm">
            <div className="text-center">
              <Users className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalParticipants}</p>
              <p className="text-sm text-gray-400">Total Participants</p>
            </div>
          </SimpleGlassCard>

          <SimpleGlassCard variant="elevated" size="sm">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalSubmissions.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Submissions</p>
            </div>
          </SimpleGlassCard>

          <SimpleGlassCard variant="elevated" size="sm">
            <div className="text-center">
              <Award className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalVotes.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Votes</p>
            </div>
          </SimpleGlassCard>

          <SimpleGlassCard variant="elevated" size="sm">
            <div className="text-center">
              <div className="h-8 w-8 bg-emerald-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-gray-900 font-bold">P</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Points</p>
            </div>
          </SimpleGlassCard>
        </div>

        {/* Seasons Table */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-emerald-400 mr-3" />
            <h2 className="text-2xl font-bold text-emerald-400">Season Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Season</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Participants</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Submissions</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Votes</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Rounds</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Voting System</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Total Points</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">Winner</th>
                </tr>
              </thead>
              <tbody>
                {sortedSeasons.map((season) => (
                  <tr key={season.season} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-400 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          S{season.season}
                        </div>
                        <span className="text-white font-medium">Season {season.season}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{season.participants.size}</td>
                    <td className="py-3 px-4 text-white">{season.submissions}</td>
                    <td className="py-3 px-4 text-white">{season.votes.toLocaleString()}</td>
                    <td className="py-3 px-4 text-white">{season.rounds}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">
                          {season.votingSystem.votesPerUser} points per user
                          {season.season === 1 && <span className="text-emerald-400">*</span>}
                        </p>
                        <p className="text-sm text-gray-400">
                          Normalization: {(30 / season.votingSystem.votesPerUser).toFixed(1)}x
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{season.totalPoints.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{season.topSubmitter.name}</p>
                        <p className="text-sm text-gray-400">{season.topSubmitter.points} pts</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footnote for Season 1 */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              <span className="text-emerald-400">*</span> Season 1, Round 1 had 10 points max. Scores have been normalized (2x multiplier) to match other rounds (20 points max).
            </p>
          </div>
        </SimpleGlassCard>
      </div>
    </div>
  );
}
