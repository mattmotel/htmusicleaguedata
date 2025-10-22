import { getDataManager } from '../../../lib/data';
import { getConfig } from '../../../lib/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = getConfig();
    const dataManager = await getDataManager();
    const submissions = dataManager.getSubmissions();
    const votes = dataManager.getVotes();
    const competitors = dataManager.getCompetitors();
    const rounds = dataManager.getRounds();
    const searchResults = dataManager.searchSubmissions('Sleater-Kinney');
    
    return NextResponse.json({
      success: true,
      config: {
        baseDataDir: config.baseDataDir,
        cwd: process.cwd()
      },
      totalSubmissions: submissions.length,
      totalVotes: votes.length,
      totalCompetitors: competitors.size,
      totalRounds: rounds.size,
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

