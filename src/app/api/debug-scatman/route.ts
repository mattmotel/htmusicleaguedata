import { getDataManager } from '../../../lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dataManager = await getDataManager();
    const submissions = dataManager.getSubmissions();
    const votes = dataManager.getVotes();

    // First, let's see what artists actually exist that might match
    const allArtists = new Set<string>();
    submissions.forEach(submission => {
      allArtists.add(submission.artist);
    });

    // Find artists that might be "Scatman John, Lou Bega"
    const possibleMatches = Array.from(allArtists).filter(artist => 
      artist.toLowerCase().includes('scatman') || 
      artist.toLowerCase().includes('lou bega') ||
      artist.toLowerCase().includes('hatman')
    );

    // Find all submissions for any of these possible matches
    const scatmanSubmissions = submissions.filter(submission => 
      possibleMatches.includes(submission.artist)
    );

    // Get all votes for these submissions
    const scatmanVotes = votes.filter(vote => 
      scatmanSubmissions.some(sub => sub.spotifyUri === vote.spotifyUri)
    );

    // Calculate detailed stats
    const submissionDetails = scatmanSubmissions.map(submission => {
      const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
      const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
      
      return {
        title: submission.title,
        album: submission.album,
        submitter: submission.submitterName,
        season: submission.season,
        round: submission.roundNumber,
        roundName: submission.roundName,
        spotifyUri: submission.spotifyUri,
        voteCount: submissionVotes.length,
        totalPoints: totalPoints,
        votes: submissionVotes.map(vote => ({
          voter: vote.voterName,
          points: vote.pointsAssigned,
          comment: vote.comment
        }))
      };
    });

    // Calculate totals
    const totalVotes = scatmanVotes.length;
    const totalPoints = scatmanVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);

    return NextResponse.json({
      artist: "Scatman John, Lou Bega",
      submissionCount: scatmanSubmissions.length,
      totalVotes: totalVotes,
      totalPoints: totalPoints,
      possibleMatches: possibleMatches,
      submissions: submissionDetails
    });
  } catch (error) {
    console.error('Error fetching Scatman data:', error);
    return NextResponse.json({ error: 'Failed to fetch Scatman data' }, { status: 500 });
  }
}
