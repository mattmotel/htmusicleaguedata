import { getDataManager, Submission } from '../../../lib/data';
import LeaderboardTabs from '../LeaderboardTabs';
import PageHeader from '../../../components/ui/PageHeader';
import { redirect } from 'next/navigation';

interface LeaderboardData {
  topSubmitters: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
    equivalizedAveragePoints: number;
  }>;
  topSubmittersByAverage: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
    equivalizedAveragePoints: number;
  }>;
  topSubmittersByEquivalizedAverage: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
    equivalizedAveragePoints: number;
  }>;
  topArtists: [string, number][];
  topAlbums: [string, number][];
  topAlbumsDetailed?: Array<{ album: string; count: number; artists: string[] }>; 
  topAlbumsByVotes: Array<{
    album: string;
    totalVotes: number;
    totalPoints: number;
    submissionCount: number;
    artists: string[];
  }>;
  topArtistsByVotes: Array<{
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submissionCount: number;
  }>;
  topSongsByVotes: Array<{
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
  }>;
  topSongsSingleSubmission: Array<{
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
  }>;
  topNormalizedSubmitters: Array<{
    submitterId: string;
    submitterName: string;
    seasons: number[];
    totalVotesReceived: number;
    normalizedScore: number;
    missedVotes: number;
  }>;
  bestSeasonPerformances: Array<{
    submitterName: string;
    season: number;
    rawScore: number;
    normalizedScore: number;
    normalizationFactor: number;
    submissions: number;
  }>;
}

const VALID_TABS = ['artists', 'albums', 'songs', 'submitters', 'point-average', 'best-seasons'];

// Generate static params for all valid tabs
export async function generateStaticParams() {
  return VALID_TABS.map((tab) => ({
    tab: tab,
  }));
}

export default async function LeaderboardTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  
  // Redirect invalid tabs to artists
  if (!VALID_TABS.includes(tab)) {
    redirect('/leaderboards/artists');
  }

  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();
  const votes = dataManager.getVotes();

  // Calculate submitter stats
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
  // First, get season normalization factors
  const seasonNormalizationFactors = new Map<number, number>();
  const allSeasons = Array.from(new Set(submissions.map(s => s.season)));
  
  allSeasons.forEach(season => {
    const seasonSubmissions = submissions.filter(s => s.season === season);
    const seasonVotes = votes.filter(v => v.season === season);
    
    if (seasonSubmissions.length === 0) return;
    
    // Calculate average points per submission for this season
    const totalPointsInSeason = seasonVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    const avgPointsPerSubmission = totalPointsInSeason / seasonSubmissions.length;
    
    // Normalization factor to bring to 30-point system
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

  // Top submitters by total points
  const topSubmitters = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      submissions: stats.submissions,
      seasons: Array.from(stats.seasons).sort((a, b) => a - b),
      totalPoints: stats.totalPoints,
      averagePoints: stats.averagePoints,
      equivalizedAveragePoints: stats.equivalizedAveragePoints
    }))
    .filter(submitter => submitter.submissions >= 10)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  // Top submitters by average points (RAW)
  const topSubmittersByAverage = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      submissions: stats.submissions,
      seasons: Array.from(stats.seasons).sort((a, b) => a - b),
      totalPoints: stats.totalPoints,
      averagePoints: stats.averagePoints,
      equivalizedAveragePoints: stats.equivalizedAveragePoints
    }))
    .filter(submitter => submitter.submissions >= 10)
    .sort((a, b) => b.averagePoints - a.averagePoints)
    .slice(0, 50);

  // Top submitters by EQUIVALIZED average points
  const topSubmittersByEquivalizedAverage = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      submissions: stats.submissions,
      seasons: Array.from(stats.seasons).sort((a, b) => a - b),
      totalPoints: stats.totalPoints,
      averagePoints: stats.averagePoints,
      equivalizedAveragePoints: stats.equivalizedAveragePoints
    }))
    .filter(submitter => submitter.submissions >= 10)
    .sort((a, b) => b.equivalizedAveragePoints - a.equivalizedAveragePoints)
    .slice(0, 50);

  // Top artists
  const topArtists = dataManager.getTopArtists(50);

  // Top albums
  const topAlbums = dataManager.getTopAlbums(50);

  // Get detailed album info with artists
  const albumArtists = new Map<string, Set<string>>();
  submissions.forEach(sub => {
    if (sub.album) {
      if (!albumArtists.has(sub.album)) {
        albumArtists.set(sub.album, new Set());
      }
      albumArtists.get(sub.album)!.add(sub.artist);
    }
  });

  const topAlbumsDetailed = topAlbums.map(([album, count]) => ({
    album,
    count,
    artists: Array.from(albumArtists.get(album) || [])
  }));

  // Top albums by votes
  const albumVotes = new Map<string, { totalVotes: number; totalPoints: number; submissionCount: number; artists: Set<string> }>();
  
  submissions.forEach(submission => {
    if (!submission.album) return;
    
    if (!albumVotes.has(submission.album)) {
      albumVotes.set(submission.album, { totalVotes: 0, totalPoints: 0, submissionCount: 0, artists: new Set() });
    }
    
    const albumData = albumVotes.get(submission.album)!;
    albumData.submissionCount++;
    albumData.artists.add(submission.artist);
    
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    albumData.totalVotes += submissionVotes.length;
    albumData.totalPoints += submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
  });

  const topAlbumsByVotesDetailed = Array.from(albumVotes.entries())
    .map(([album, data]) => ({
      album,
      totalVotes: data.totalVotes,
      totalPoints: data.totalPoints,
      submissionCount: data.submissionCount,
      artists: Array.from(data.artists)
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  // Top artists by votes
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

  const topArtistsByVotes = Array.from(artistVotes.entries())
    .map(([artist, data]) => ({
      artist,
      totalVotes: data.totalVotes,
      totalPoints: data.totalPoints,
      submissionCount: data.submissionCount
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  // Top songs by votes - group by song with individual submissions listed
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

  const topSongsByVotes = Array.from(songGroupedSubmissions.values())
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  // Top songs (single submission only)
  const topSongsSingleSubmission = Array.from(songGroupedSubmissions.values())
    .filter(song => song.submissions.length === 1)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 50);

  // Calculate normalized scores with missed votes
  const submitterNormalizedScores = new Map<string, {
    submitterId: string;
    submitterName: string;
    seasons: Set<number>;
    totalVotesReceived: number;
    missedVotes: number;
  }>();

  // Track which rounds each submitter participated in
  const submitterRounds = new Map<string, Set<string>>();
  submissions.forEach(sub => {
    if (!submitterRounds.has(sub.submitterId)) {
      submitterRounds.set(sub.submitterId, new Set());
    }
    submitterRounds.get(sub.submitterId)!.add(sub.roundId);
  });

  // Calculate votes received and missed votes
  submissions.forEach(submission => {
    if (!submitterNormalizedScores.has(submission.submitterId)) {
      submitterNormalizedScores.set(submission.submitterId, {
        submitterId: submission.submitterId,
        submitterName: submission.submitterName,
        seasons: new Set(),
        totalVotesReceived: 0,
        missedVotes: 0
      });
    }
    
    const data = submitterNormalizedScores.get(submission.submitterId)!;
    data.seasons.add(submission.season);
    
    // Count votes received for this submission
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    data.totalVotesReceived += submissionVotes.length;
    
    // Calculate expected voters (other submitters in this round)
    const roundSubmissions = submissions.filter(sub => sub.roundId === submission.roundId);
    const expectedVoters = new Set(roundSubmissions.map(sub => sub.submitterId));
    expectedVoters.delete(submission.submitterId); // Can't vote for yourself
    
    const actualVoters = new Set(submissionVotes.map(vote => vote.voterId));
    const missedVotes = expectedVoters.size - actualVoters.size;
    data.missedVotes += missedVotes;
  });

  const topNormalizedSubmitters = Array.from(submitterNormalizedScores.values())
    .filter(data => data.totalVotesReceived > 0)
    .map(data => ({
      submitterId: data.submitterId,
      submitterName: data.submitterName,
      seasons: Array.from(data.seasons).sort((a, b) => a - b),
      totalVotesReceived: data.totalVotesReceived,
      normalizedScore: data.totalVotesReceived - (data.missedVotes * 0.5),
      missedVotes: data.missedVotes
    }))
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 50);

  // Calculate best season performances
  const seasonPerformances: Array<{
    submitterName: string;
    season: number;
    rawScore: number;
    normalizedScore: number;
    normalizationFactor: number;
    submissions: number;
  }> = [];

  // Get seasons with valid normalization factors
  const seasonsForPerformances = Array.from(seasonNormalizationFactors.keys());

  seasonsForPerformances.forEach(season => {
    const normalizationFactor = seasonNormalizationFactors.get(season) || 1;
    const seasonSubmissions = submissions.filter(s => s.season === season);
    
    // Track submitter scores for this season
    const seasonSubmitterScores = new Map<string, { rawScore: number; submissions: number }>();
    
    seasonSubmissions.forEach(submission => {
      const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
      const submissionPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
      
      const current = seasonSubmitterScores.get(submission.submitterName) || { rawScore: 0, submissions: 0 };
      current.rawScore += submissionPoints;
      current.submissions++;
      seasonSubmitterScores.set(submission.submitterName, current);
    });
    
    // Add to performances array
    seasonSubmitterScores.forEach((data, submitterName) => {
      seasonPerformances.push({
        submitterName,
        season,
        rawScore: data.rawScore,
        normalizedScore: data.rawScore * normalizationFactor,
        normalizationFactor,
        submissions: data.submissions
      });
    });
  });

  const bestSeasonPerformances = seasonPerformances
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 50);

  const leaderboardData: LeaderboardData = {
    topSubmitters,
    topSubmittersByAverage,
    topSubmittersByEquivalizedAverage,
    topArtists,
    topAlbums,
    topAlbumsDetailed,
    topAlbumsByVotes: topAlbumsByVotesDetailed,
    topArtistsByVotes,
    topSongsByVotes,
    topSongsSingleSubmission,
    topNormalizedSubmitters,
    bestSeasonPerformances
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="Overall Leaderboards"
            description="Rankings across all seasons for submitters, artists, albums, and vote performance"
          />

          {/* Leaderboard Tabs */}
          <LeaderboardTabs data={leaderboardData} currentTab={tab} />
        </div>
      </div>
    </div>
  );
}

