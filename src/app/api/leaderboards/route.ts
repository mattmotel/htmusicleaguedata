import { getDataManager, Submission } from '../../../lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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

    return NextResponse.json({
      topSubmitters,
      topSubmittersByAverage,
      topArtists,
      topAlbums,
      topAlbumsDetailed,
      topArtistsByVotes,
      topSongsByVotes,
      topSongsSingleSubmission
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
