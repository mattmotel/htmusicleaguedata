import { getDataManager } from '../../lib/data';
import { Trophy, Users, Music } from 'lucide-react';

export default async function LeaderboardsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();
  const votes = dataManager.getVotes();
  const competitors = dataManager.getCompetitors();

  // Calculate submitter stats
  const submitterStats = new Map<string, {
    name: string;
    submissions: number;
    seasons: Set<number>;
    totalPoints: number;
    averagePoints: number;
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
        averagePoints: 0
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

  // Top submitters
  const topSubmitters = Array.from(submitterStats.entries())
    .map(([id, stats]) => ({
      id,
      ...stats,
      seasonsCount: stats.seasons.size
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  // Top artists
  const artistStats = new Map<string, number>();
  submissions.forEach(submission => {
    const artist = submission.artist;
    artistStats.set(artist, (artistStats.get(artist) || 0) + 1);
  });

  const topArtists = Array.from(artistStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Top albums
  const albumStats = new Map<string, number>();
  submissions.forEach(submission => {
    if (submission.album) {
      const album = submission.album;
      albumStats.set(album, (albumStats.get(album) || 0) + 1);
    }
  });

  const topAlbums = Array.from(albumStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

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
  const submissionsBySong = new Map<string, any[]>();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Overall Leaderboards</h1>
        <p className="text-gray-400">Rankings across all seasons for submitters, artists, albums, and vote performance</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Top Submitters */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Submitters</h2>
            </div>
            
            <div className="space-y-3">
              {topSubmitters.map((submitter, index) => (
                <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{submitter.name}</p>
                      <p className="text-sm text-gray-400">{submitter.submissions} submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{submitter.totalPoints}</p>
                    <p className="text-sm text-gray-400">{submitter.averagePoints} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Music className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Artists</h2>
            </div>
            
            <div className="space-y-3">
              {topArtists.map(([artist, count], index) => (
                <div key={artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{count}</p>
                    <p className="text-sm text-gray-400">submissions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Albums */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Albums</h2>
            </div>
            
            <div className="space-y-3">
              {topAlbums.map(([album, count], index) => (
                <div key={album} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{album}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{count}</p>
                    <p className="text-sm text-gray-400">submissions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Votes per Artist */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Music className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Most Votes per Artist</h2>
            </div>
            
            <div className="space-y-3">
              {topArtistsByVotes.map((artist, index) => (
                <div key={artist.artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{artist.artist}</p>
                      <p className="text-sm text-gray-400">{artist.submissionCount} submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{artist.totalVotes}</p>
                    <p className="text-sm text-gray-400">{artist.totalPoints} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Votes per Song */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Most Votes per Song</h2>
            </div>
            
            <div className="space-y-3">
              {topSongsByVotes.map((song, index) => (
                <div key={`${song.title}-${song.artist}`} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-300">by {song.artist}</p>
                      <p className="text-xs text-gray-400">{song.submitter}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{song.totalVotes} unique voters</p>
                    <p className="text-sm text-gray-400">{song.totalPoints} total pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
