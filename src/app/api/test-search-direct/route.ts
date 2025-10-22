import { getDataManager } from '../../../lib/data';
import { NextResponse } from 'next/server';

// This API endpoint mimics exactly what the search page does
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    console.log('[API Test] Starting...');
    const dataManager = await getDataManager();
    console.log(`[API Test] DataManager loaded`);
    
    const allSubmissions = dataManager.getSubmissions();
    console.log(`[API Test] Total submissions: ${allSubmissions.length}`);
    console.log(`[API Test] Query: "${query}"`);
    
    let searchResults = dataManager.searchSubmissions(query);
    console.log(`[API Test] Search results: ${searchResults.length}`);
    
    return NextResponse.json({
      success: true,
      query,
      totalSubmissions: allSubmissions.length,
      searchResultsCount: searchResults.length,
      searchResults: searchResults.slice(0, 3).map(s => ({
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

