import { getDataManager } from '../lib/data';
import { getConfig } from '../lib/config';
import PageHeader from '../components/ui/PageHeader';
import MusicAnalytics from '../components/ui/MusicAnalytics';
import SimpleGlassCard from '../components/ui/SimpleGlassCard';
import { Trophy, Music, Users, TrendingUp, Mic, Disc3 } from 'lucide-react';
import { redirect } from 'next/navigation';
import AnimatedCounter from '../components/ui/AnimatedCounter';

export default async function Home() {
  const dataManager = await getDataManager();
  const config = getConfig();
  const stats = dataManager.getOverallStats();
  const votes = dataManager.getVotes();
  const submissions = dataManager.getSubmissions();

  // Get top artists by votes
  const artistVotes = new Map<string, { totalVotes: number; totalPoints: number; submissionCount: number }>();
  
  submissions.forEach(submission => {
    if (!artistVotes.has(submission.artist)) {
      artistVotes.set(submission.artist, { totalVotes: 0, totalPoints: 0, submissionCount: 0 });
    }
    
    const artistData = artistVotes.get(submission.artist)!;
    artistData.submissionCount++;
    
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    artistData.totalVotes += submissionVotes.length;
    artistData.totalPoints += submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
  });

  const topArtists = Array.from(artistVotes.entries())
    .map(([artist, data]) => ({
      artist,
      totalVotes: data.totalVotes,
      totalPoints: data.totalPoints,
      submissionCount: data.submissionCount
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  // COPY EXACT LOGIC FROM LEADERBOARD - Top songs (single submission only)
  const songGroupedSubmissions = new Map<string, {
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submissions: Array<{
      submitter: string;
      season: number;
      round: number;
      votes: number;
      points: number;
      spotifyUri: string;
    }>;
  }>();

  submissions.forEach(submission => {
    const key = `${submission.title}|||${submission.artist}`;
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    const submissionPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    
    if (!songGroupedSubmissions.has(key)) {
      songGroupedSubmissions.set(key, {
        title: submission.title,
        artist: submission.artist,
        totalVotes: 0,
        totalPoints: 0,
        submissions: []
      });
    }
    
    const songData = songGroupedSubmissions.get(key)!;
    songData.totalVotes += submissionVotes.length;
    songData.totalPoints += submissionPoints;
    songData.submissions.push({
      submitter: submission.submitterName,
      season: submission.season,
      round: submission.roundNumber,
      votes: submissionVotes.length,
      points: submissionPoints,
      spotifyUri: submission.spotifyUri
    });
  });

  // EXACT COPY FROM LEADERBOARD - Top songs (single submission only)
  const topSongsSingleSubmission = Array.from(songGroupedSubmissions.values())
    .filter(song => song.submissions.length === 1)
    .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by POINTS descending
    .slice(0, 50);

  const topSongs = topSongsSingleSubmission.map(song => ({
    title: song.title,
    artist: song.artist,
    submitter: song.submissions[0].submitter,
    season: song.submissions[0].season,
    round: song.submissions[0].round,
    totalVotes: song.submissions[0].votes,
    totalPoints: song.submissions[0].points,
    spotifyUri: song.submissions[0].spotifyUri
  }));

  // Get top submitters with proper calculation (same as leaderboard)
  const submitterStats = new Map<string, {
    name: string;
    submissions: number;
    seasons: Set<number>;
    totalPoints: number;
    averagePoints: number;
    equivalizedAveragePoints: number;
  }>();

  submissions.forEach(submission => {
    const submitterId = submission.submitterId;
    const submitterName = submission.submitterName;
    
    if (!submitterStats.has(submitterId)) {
      submitterStats.set(submitterId, {
        name: submitterName,
        submissions: 0,
        seasons: new Set(),
        totalPoints: 0,
        averagePoints: 0,
        equivalizedAveragePoints: 0
      });
    }
    
    const stats = submitterStats.get(submitterId)!;
    stats.submissions++;
    stats.seasons.add(submission.season);
  });

  // Calculate points for each submission
  submissions.forEach(submission => {
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    
    const submitterData = submitterStats.get(submission.submitterId);
    if (submitterData) {
      submitterData.totalPoints += totalPoints;
    }
  });

  // Calculate averages
  submitterStats.forEach(stats => {
    stats.averagePoints = stats.submissions > 0 ? Number((stats.totalPoints / stats.submissions).toFixed(1)) : 0;
  });

  // Calculate equivalized average points (normalized to 30-point system)
  const seasonNormalizationFactors = new Map<number, number>();
  const allSeasons = Array.from(new Set(submissions.map(s => s.season)));
  
  allSeasons.forEach(season => {
    const seasonSubmissions = submissions.filter(s => s.season === season);
    const seasonVotes = votes.filter(v => v.season === season);
    
    if (seasonSubmissions.length === 0) return;
    
    const totalPointsInSeason = seasonVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    const avgPointsPerSubmission = totalPointsInSeason / seasonSubmissions.length;
    
    const normalizationFactor = avgPointsPerSubmission > 0 ? 30 / avgPointsPerSubmission : 1;
    seasonNormalizationFactors.set(season, normalizationFactor);
  });

  // Calculate equivalized averages
  submitterStats.forEach((stats, submitterId) => {
    let totalEquivalizedPoints = 0;
    
    submissions.forEach(submission => {
      if (submission.submitterId === submitterId) {
        const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
        const submissionPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
        const normalizationFactor = seasonNormalizationFactors.get(submission.season) || 1;
        totalEquivalizedPoints += submissionPoints * normalizationFactor;
      }
    });
    
    stats.equivalizedAveragePoints = stats.submissions > 0 ? 
      Number((totalEquivalizedPoints / stats.submissions).toFixed(1)) : 0;
  });

  const topSubmitters = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({
      name: stats.name,
      totalPoints: stats.totalPoints,
      submissions: stats.submissions,
      averagePoints: stats.averagePoints,
      equivalizedAveragePoints: stats.equivalizedAveragePoints
    }))
    .filter(submitter => submitter.submissions >= 3) // Minimum submissions like leaderboard
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="Hard Times Music League"
            description="Discover the most popular artists, highest-scoring songs, and most efficient submitters in your music league"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stats.totalSubmissions} />
                  </p>
                  <p className="text-sm text-gray-400">Total Submissions</p>
                </div>
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stats.uniqueArtists} />
                  </p>
                  <p className="text-sm text-gray-400">Unique Artists</p>
                </div>
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                  <Disc3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stats.uniqueAlbums} />
                  </p>
                  <p className="text-sm text-gray-400">Unique Albums</p>
                </div>
              </div>
            </SimpleGlassCard>

            <SimpleGlassCard variant="elevated" size="md">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={votes.length} />
                  </p>
                  <p className="text-sm text-gray-400">Total Votes</p>
                </div>
              </div>
            </SimpleGlassCard>
          </div>

          {/* Music Analytics */}
          <MusicAnalytics 
            topArtists={topArtists}
            topSongs={topSongs}
            topSubmitters={topSubmitters}
          />
        </div>
      </div>
    </div>
  );
}