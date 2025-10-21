import { getDataManager, Submission } from '../../lib/data';
import { Trophy, Users, Music, Star } from 'lucide-react';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';

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
  topArtists: [string, number][];
  topAlbums: [string, number][];
  topAlbumsDetailed?: Array<{ album: string; count: number; artists: string[] }>; 
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
    submitter: string;
    season: number;
    round: number;
    allSeasonsRounds: string;
  }>;
  topSongsSingleSubmission: Array<{
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submitter: string;
    season: number;
    round: number;
    allSeasonsRounds: string;
  }>;
}

export default async function LeaderboardsPage() {
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
    const seasonRoundIds = new Set(seasonSubmissions.map(s => s.roundId));
    const roundsMap = dataManager.getRounds();
    const seasonRounds = Array.from(roundsMap.values()).filter(r => seasonRoundIds.has(r.id));
    
    // Find the first round chronologically
    const firstRound = seasonRounds.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    
    if (firstRound) {
      const firstRoundVotesList = seasonVotes.filter(v => v.roundId === firstRound.id);
      
      // Find Matt's voter ID
      const competitors = dataManager.getCompetitors();
      let mattVoterId = '';
      for (const [voterId, voterName] of competitors.entries()) {
        if (voterName === 'Matt McInerney') {
          mattVoterId = voterId;
          break;
        }
      }
      
      // Calculate points per user for this season
      const pointsPerUser = mattVoterId ? firstRoundVotesList.filter(v => v.voterId === mattVoterId).reduce((sum, vote) => sum + vote.pointsAssigned, 0) : 0;
      
      // Calculate normalization factor (30 / pointsPerUser)
      const normalizationFactor = pointsPerUser > 0 ? 30 / pointsPerUser : 1;
      seasonNormalizationFactors.set(season, normalizationFactor);
    }
  });

  // Calculate equivalized average points for each submitter
  submitterStats.forEach(stats => {
    let equivalizedTotalPoints = 0;
    let equivalizedSubmissions = 0;
    
    // Get all submissions for this submitter
    const submitterSubmissions = submissions.filter(s => s.submitterId === stats.name || s.submitterName === stats.name);
    
    submitterSubmissions.forEach(submission => {
      const seasonFactor = seasonNormalizationFactors.get(submission.season) || 1;
      const submissionVotes = votes.filter(v => v.spotifyUri === submission.spotifyUri);
      const submissionPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
      const equivalizedPoints = submissionPoints * seasonFactor;
      
      equivalizedTotalPoints += equivalizedPoints;
      equivalizedSubmissions++;
    });
    
    stats.equivalizedAveragePoints = equivalizedSubmissions > 0 ? Number((equivalizedTotalPoints / equivalizedSubmissions).toFixed(1)) : 0;
  });

  const topSubmitters = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({ id, ...stats, seasons: Array.from(stats.seasons) }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  // Top submitters by average points per submission
  const topSubmittersByAverage = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({ id, ...stats, seasons: Array.from(stats.seasons) }))
    .filter(stats => stats.submissions >= 3) // Only include submitters with 3+ submissions
    .sort((a, b) => b.averagePoints - a.averagePoints)
    .slice(0, 20);

  // Calculate artist stats
  const artistStats = new Map<string, number>();
  submissions.forEach(submission => {
    const artist = submission.artist;
    artistStats.set(artist, (artistStats.get(artist) || 0) + 1);
  });

  const topArtists = Array.from(artistStats.entries())
    .sort((a, b) => b[1] - a[1]);

  // Calculate album stats
  const albumStats = new Map<string, number>();
  submissions.forEach(submission => {
    const album = submission.album;
    albumStats.set(album, (albumStats.get(album) || 0) + 1);
  });

  const topAlbums = Array.from(albumStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // For each top album, collect unique artists
  const topAlbumsDetailed = topAlbums.map(([album, count]) => {
    const artistsSet = new Set<string>();
    submissions.forEach(sub => {
      if ((sub.album || '').trim() === album) {
        artistsSet.add(sub.artist);
      }
    });
    const artists = Array.from(artistsSet).sort((a, b) => a.localeCompare(b));
    return { album, count, artists };
  });

  // Calculate most votes per artist
  const artistVoteStats = new Map<string, { artist: string; totalVotes: number; totalPoints: number; submissionCount: number }>();

  submissions.forEach(submission => {
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);

    if (!artistVoteStats.has(submission.artist)) {
      artistVoteStats.set(submission.artist, {
        artist: submission.artist,
        totalVotes: 0,
        totalPoints: 0,
        submissionCount: 0
      });
    }

    const stats = artistVoteStats.get(submission.artist)!;
    stats.totalVotes += submissionVotes.length;
    stats.totalPoints += totalPoints;
    stats.submissionCount++;
  });

  const topArtistsByVotes = Array.from(artistVoteStats.values())
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 20);

  // Calculate normalized voting stats (accounts for different voting systems per season)
  const normalizedVoteStats = new Map<string, {
    submitterId: string;
    submitterName: string;
    seasons: number[];
    totalVotesReceived: number;
    totalVotesPossible: number;
    normalizedScore: number;
    averageVotesPerSeason: number;
  }>();

  // Get all unique voters per season to calculate possible votes
  const seasonVoterStats = new Map<number, Set<string>>();
  votes.forEach(vote => {
    if (!seasonVoterStats.has(vote.season)) {
      seasonVoterStats.set(vote.season, new Set());
    }
    seasonVoterStats.get(vote.season)!.add(vote.voterId);
  });

  // Calculate normalized scores for each submitter
  submissions.forEach(submission => {
    const submitterId = submission.submitterId;
    const submitterName = submission.submitterName;
    
    if (!normalizedVoteStats.has(submitterId)) {
      normalizedVoteStats.set(submitterId, {
        submitterId,
        submitterName,
        seasons: [],
        totalVotesReceived: 0,
        totalVotesPossible: 0,
        normalizedScore: 0,
        averageVotesPerSeason: 0
      });
    }
    
    const stats = normalizedVoteStats.get(submitterId)!;
    if (!stats.seasons.includes(submission.season)) {
      stats.seasons.push(submission.season);
    }
    
    // Get votes for this submission
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    stats.totalVotesReceived += submissionVotes.length;
    
    // Calculate possible votes for this season (number of voters in this season)
    const votersInSeason = seasonVoterStats.get(submission.season)?.size || 0;
    stats.totalVotesPossible += votersInSeason;
  });

  // Calculate normalized scores
  normalizedVoteStats.forEach(stats => {
    if (stats.totalVotesPossible > 0) {
      stats.normalizedScore = (stats.totalVotesReceived / stats.totalVotesPossible) * 100;
      stats.averageVotesPerSeason = stats.totalVotesReceived / stats.seasons.length;
    }
  });

  const topNormalizedSubmitters = Array.from(normalizedVoteStats.values())
    .filter(stats => stats.seasons.length >= 3) // Only include submitters with 3+ seasons
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 20);

  // Calculate most votes per song (group by title + artist to avoid double counting)
  const songVoteStats = new Map<string, {
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submitter: string;
    season: number;
    round: number;
    allSeasonsRounds: string;
  }>();

  // Group submissions by song title + artist to avoid double counting
  const submissionsBySong = new Map<string, Submission[]>();
  submissions.forEach(submission => {
    const key = `${submission.title} - ${submission.artist}`;
    if (!submissionsBySong.has(key)) {
      submissionsBySong.set(key, []);
    }
    submissionsBySong.get(key)!.push(submission);
  });

  // Calculate votes for each unique song (only count each vote once per song)
  submissionsBySong.forEach((songSubmissions, songKey) => {
    const firstSubmission = songSubmissions[0];
    const allSpotifyUris = songSubmissions.map(s => s.spotifyUri);

    // Get all votes for any submission of this song, but deduplicate by voter
    const songVotes = votes.filter(vote => allSpotifyUris.includes(vote.spotifyUri));

    // Deduplicate votes by voter ID to avoid counting the same voter multiple times
    const uniqueVotes = new Map();
    songVotes.forEach(vote => {
      if (!uniqueVotes.has(vote.voterId)) {
        uniqueVotes.set(vote.voterId, vote);
      }
    });

    const deduplicatedVotes = Array.from(uniqueVotes.values());
    const totalPoints = deduplicatedVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);

    // Create paired submitter + season/round info
    const submitterSeasonPairs = songSubmissions.map(s => `${s.submitterName} (S${s.season} R${s.roundNumber})`).join(', ');

    songVoteStats.set(songKey, {
      title: firstSubmission.title,
      artist: firstSubmission.artist,
      totalVotes: deduplicatedVotes.length,
      totalPoints: totalPoints,
      submitter: submitterSeasonPairs,
      season: firstSubmission.season,
      round: firstSubmission.roundNumber,
      allSeasonsRounds: submitterSeasonPairs
    });
  });

  const topSongsByVotes = Array.from(songVoteStats.values())
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 20);

  // Calculate songs with most votes from single submission only
  const topSongsSingleSubmission = Array.from(songVoteStats.values())
    .filter(song => song.allSeasonsRounds.split(', ').length === 1)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  const data = {
    topSubmitters,
    topSubmittersByAverage,
    topArtists,
    topAlbums,
    topAlbumsDetailed,
    topArtistsByVotes,
    topSongsByVotes,
    topSongsSingleSubmission
  };

  const displayedArtists = data.topArtists.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Overall Leaderboards
            </h1>
            <p className="text-lg text-slate-300">
              Rankings across all seasons for submitters, artists, albums, and vote performance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Top Artists with View All */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Music className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Artists</h2>
            </div>
            {data.topArtists.length > 20 && (
              <a
                href="/artists"
                className="text-sm text-green-400 hover:text-green-300 underline"
              >
                View All {data.topArtists.length.toLocaleString()}
              </a>
            )}
          </div>
          
          <div className="space-y-3">
            {displayedArtists.map(([artist, count], index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{artist}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-400 whitespace-nowrap">{count}</p>
                  <p className="text-sm text-gray-400">submissions</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Albums */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Top Albums</h2>
          </div>
          
          <div className="space-y-3">
            {(data.topAlbumsDetailed && data.topAlbumsDetailed.length > 0
              ? data.topAlbumsDetailed.map((row) => [row.album, row.count] as [string, number])
              : data.topAlbums
            ).map(([album, count], index) => {
              const artists = data.topAlbumsDetailed?.find(a => a.album === album)?.artists || [];
              return (
                <div key={album} className="p-3 bg-gray-700 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{album}</p>
                        {artists.length > 0 && (
                          <p className="text-xs text-gray-400">{artists.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-green-400 whitespace-nowrap">{count}</p>
                      <p className="text-sm text-gray-400">submissions</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SimpleGlassCard>

        {/* Most Votes per Artist */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Music className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Most Votes per Artist</h2>
          </div>

          <div className="space-y-3">
            {data.topArtistsByVotes.map((artist, index) => (
              <div key={artist.artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{artist.artist}</p>
                    <p className="text-sm text-gray-400">{artist.submissionCount} submissions</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-400 whitespace-nowrap">{artist.totalVotes}</p>
                  <p className="text-sm text-gray-400 whitespace-nowrap">{artist.totalPoints} pts</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Most Votes per Song */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Most Votes per Song</h2>
          </div>

          <div className="space-y-3">
            {data.topSongsByVotes.map((song, index) => (
              <div key={`${song.title}-${song.artist}`} className="p-4 bg-gray-700 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-lg">{song.title}</p>
                      <p className="text-sm text-gray-300 mb-2">by {song.artist}</p>
                      <div className="space-y-1">
                        {song.allSeasonsRounds.split(', ').map((submission, subIndex) => (
                          <p key={subIndex} className="text-xs text-gray-400">
                            {submission}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-green-400 text-lg">{song.totalVotes}</p>
                    <p className="text-xs text-gray-400">unique voters</p>
                    <p className="font-bold text-green-400 text-lg mt-1">{song.totalPoints}</p>
                    <p className="text-xs text-gray-400">total pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Most Votes per Song (Single Submission Only) */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Most Votes (Single Submission)</h2>
          </div>

          <div className="space-y-3">
            {data.topSongsSingleSubmission.map((song, index) => (
              <div key={`${song.title}-${song.artist}`} className="p-4 bg-gray-700 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-lg">{song.title}</p>
                      <p className="text-sm text-gray-300 mb-2">by {song.artist}</p>
                      <p className="text-xs text-gray-400">{song.allSeasonsRounds}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-green-400 text-lg">{song.totalPoints}</p>
                    <p className="text-xs text-gray-400">total pts</p>
                    <p className="font-bold text-green-400 text-lg mt-1">{song.totalVotes}</p>
                    <p className="text-xs text-gray-400">unique voters</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Submitters by Average Points */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Highest Average Points</h2>
          </div>
          
          <div className="space-y-3">
            {data.topSubmittersByAverage.map((submitter, index) => (
              <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{submitter.name}</p>
                    <p className="text-sm text-gray-400">{submitter.submissions} submissions across {submitter.seasons.length} seasons</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{submitter.averagePoints} avg pts</p>
                  <p className="text-sm text-gray-400">{submitter.totalPoints} total pts</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Submitters by Equivalized Average Points */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-bold text-blue-400">Highest Equivalized Average Points</h2>
          </div>
          <p className="text-gray-400 mb-6 text-sm">
            Normalized to 30-point system to compare across different voting systems
          </p>
          
          <div className="space-y-3">
            {data.topSubmittersByAverage.map((submitter, index) => (
              <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{submitter.name}</p>
                    <p className="text-sm text-gray-400">{submitter.submissions} submissions across {submitter.seasons.length} seasons</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-400">{submitter.equivalizedAveragePoints} equiv avg pts</p>
                  <p className="text-sm text-gray-400">{submitter.averagePoints} raw avg pts</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Normalized Voting Performance */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-emerald-400 mr-3" />
            <h2 className="text-2xl font-bold text-emerald-400">Normalized Voting Performance</h2>
          </div>
          <p className="text-gray-400 mb-6 text-sm">
            Accounts for different voting systems across seasons (20 points vs 10 points per player)
          </p>
          
          <div className="space-y-3">
            {topNormalizedSubmitters.map((submitter, index) => (
              <div key={submitter.submitterId} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{submitter.submitterName}</p>
                    <p className="text-sm text-gray-400">{submitter.seasons.length} seasons • {submitter.totalVotesReceived} votes received</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{submitter.normalizedScore.toFixed(1)}%</p>
                  <p className="text-sm text-gray-400">normalized score</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Submitters - MOVED TO BOTTOM */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Top Submitters</h2>
          </div>
          
          <div className="space-y-3">
            {data.topSubmitters.map((submitter, index) => (
              <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{submitter.name}</p>
                    <p className="text-sm text-gray-400">{submitter.submissions} submissions across {submitter.seasons.length} seasons</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{submitter.totalPoints} pts</p>
                  <p className="text-sm text-gray-400">{submitter.averagePoints} avg/sub</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>
      </div>

        </div>
      </div>
    </div>
  );
}