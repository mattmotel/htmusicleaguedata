import { getDataManager } from '../../../lib/data';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    const dataManager = await getDataManager();
    const results = dataManager.searchSubmissions(query);
    
    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

