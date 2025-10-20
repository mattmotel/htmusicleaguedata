import { getDataManager } from '../../../lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dataManager = await getDataManager();
    const submissions = dataManager.getSubmissions();

    // Search for any artist containing "Scatman" or "Lou Bega"
    const scatmanArtists = new Set<string>();
    
    submissions.forEach(submission => {
      const artist = submission.artist.toLowerCase();
      if (artist.includes('scatman') || artist.includes('lou bega') || artist.includes('hatman') || artist.includes('bega')) {
        scatmanArtists.add(submission.artist);
      }
    });

    // Also search for the exact artist from leaderboards
    const leaderboardArtist = "Scatman John, Lou Bega";
    const exactMatch = submissions.filter(sub => sub.artist === leaderboardArtist);

    // Get all unique artists to see what's available
    const allArtists = new Set<string>();
    submissions.forEach(submission => {
      allArtists.add(submission.artist);
    });

    // Find artists that might be related
    const relatedArtists = Array.from(allArtists).filter(artist => 
      artist.toLowerCase().includes('scatman') || 
      artist.toLowerCase().includes('lou') ||
      artist.toLowerCase().includes('bega') ||
      artist.toLowerCase().includes('hatman')
    );

    return NextResponse.json({
      foundScatmanArtists: Array.from(scatmanArtists),
      relatedArtists: relatedArtists,
      totalArtists: allArtists.size,
      sampleArtists: Array.from(allArtists).slice(0, 20),
      exactMatchCount: exactMatch.length,
      exactMatchSubmissions: exactMatch.map(sub => ({
        title: sub.title,
        artist: sub.artist,
        submitter: sub.submitterName,
        season: sub.season,
        round: sub.roundNumber
      }))
    });
  } catch (error) {
    console.error('Error searching for artists:', error);
    return NextResponse.json({ error: 'Failed to search artists' }, { status: 500 });
  }
}
