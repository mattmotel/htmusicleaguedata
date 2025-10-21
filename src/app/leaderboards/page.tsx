import { getDataManager, Submission } from '../../lib/data';
import { Trophy, Users, Music, Star, BarChart3, TrendingUp } from 'lucide-react';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';
import LeaderboardTabs from './LeaderboardTabs';

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
  topNormalizedSubmitters: Array<{
    submitterId: string;
    submitterName: string;
    seasons: number[];
    totalVotesReceived: number;
    normalizedScore: number;
    missedVotes: number;
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
  const albumVoteStats = new Map<string, { album: string; totalVotes: number; totalPoints: number; submissionCount: number }>();
  
  submissions.forEach(submission => {
    const album = submission.album;
    albumStats.set(album, (albumStats.get(album) || 0) + 1);
    
    // Calculate votes for this album
    const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
    const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    
    if (!albumVoteStats.has(album)) {
      albumVoteStats.set(album, {
        album: album,
        totalVotes: 0,
        totalPoints: 0,
        submissionCount: 0
      });
    }
    
    const stats = albumVoteStats.get(album)!;
    stats.totalVotes += submissionVotes.length;
    stats.totalPoints += totalPoints;
    stats.submissionCount++;
  });

  const topAlbums = Array.from(albumStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
    
  const topAlbumsByVotes = Array.from(albumVoteStats.values())
    .sort((a, b) => b.totalVotes - a.totalVotes)
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

  // Also create detailed data for albums by votes
  const topAlbumsByVotesDetailed = topAlbumsByVotes.map(album => {
    const artistsSet = new Set<string>();
    submissions.forEach(sub => {
      if ((sub.album || '').trim() === album.album) {
        artistsSet.add(sub.artist);
      }
    });
    const artists = Array.from(artistsSet).sort((a, b) => a.localeCompare(b));
    return { ...album, artists };
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

    // Calculate missed votes for each submitter
    const submitterMissedVotes = new Map<string, number>();
    
    // Group submissions by season and round to calculate missed votes
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

    // Calculate missed votes for each round
    submissionsBySeason.forEach((roundsMap, season) => {
      roundsMap.forEach((roundSubmissions, roundNumber) => {
        const roundId = roundSubmissions[0]?.roundId;
        
        // Get all voters for this round
        const roundVotes = votes.filter(vote => vote.roundId === roundId);
        const voters = new Set(roundVotes.map(vote => vote.voterId));
        
        // Get all submitters for this round
        const submitters = new Set(roundSubmissions.map(sub => sub.submitterId));
        
        // Expected voters should be all submitters (they should vote on each other's submissions)
        const expectedVoters = new Set(submitters);
        const missingVoters = Array.from(expectedVoters).filter(voterId => !voters.has(voterId));
        
        // Count missed votes for each submitter
        missingVoters.forEach(voterId => {
          submitterMissedVotes.set(voterId, (submitterMissedVotes.get(voterId) || 0) + 1);
        });
      });
    });

    // Calculate normalized voting performance
    const topNormalizedSubmitters = Array.from(submitterStats.entries())
      .map(([id, stats]) => ({ id, ...stats, seasons: Array.from(stats.seasons) }))
      .map(submitter => {
        const submitterSubmissions = submissions.filter(s => s.submitterId === submitter.id);
        const totalVotesReceived = submitterSubmissions.reduce((total, submission) => {
          const submissionVotes = votes.filter(v => v.spotifyUri === submission.spotifyUri);
          return total + submissionVotes.length;
        }, 0);
        
        const normalizedScore = submitter.submissions > 0 ? (totalVotesReceived / submitter.submissions) * 10 : 0;
        
        return {
          submitterId: submitter.id,
          submitterName: submitter.name,
          seasons: submitter.seasons,
          totalVotesReceived,
          normalizedScore,
          missedVotes: submitterMissedVotes.get(submitter.id) || 0
        };
      })
      .sort((a, b) => b.normalizedScore - a.normalizedScore)
      .slice(0, 20);

  const leaderboardData: LeaderboardData = {
    topSubmitters,
    topSubmittersByAverage,
    topArtists,
    topAlbums,
    topAlbumsDetailed,
    topAlbumsByVotes: topAlbumsByVotesDetailed,
    topArtistsByVotes,
    topSongsByVotes,
    topSongsSingleSubmission,
    topNormalizedSubmitters
  };

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

          {/* Leaderboard Tabs */}
          <LeaderboardTabs data={leaderboardData} />
        </div>
      </div>
    </div>
  );
}
