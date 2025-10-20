import { NextRequest, NextResponse } from 'next/server';
import { getDataManager } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    const dataManager = await getDataManager();
    
    if (season) {
      const seasonNumber = parseInt(season, 10);
      const submissions = dataManager.getSubmissionsBySeason(seasonNumber);
      return NextResponse.json(submissions);
    } else {
      const submissions = dataManager.getSubmissions();
      return NextResponse.json(submissions);
    }
  } catch (error) {
    console.error('Submissions API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
