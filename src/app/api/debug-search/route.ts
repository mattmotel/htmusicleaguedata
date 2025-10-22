import { getDataManager } from '../../../lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dataManager = await getDataManager();
    const submissions = dataManager.getSubmissions();
    const searchResults = dataManager.searchSubmissions('Sleater-Kinney');
    
    return NextResponse.json({
      success: true,
      totalSubmissions: submissions.length,
      searchResults: searchResults.length,
      sampleSubmissions: submissions.slice(0, 3).map(s => ({
        title: s.title,
        artist: s.artist,
        album: s.album
      })),
      searchResultsDetails: searchResults.map(s => ({
        title: s.title,
        artist: s.artist,
        album: s.album
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

