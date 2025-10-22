import { NextResponse } from 'next/server';
import { getDataManager } from '../../../lib/data';

export async function GET() {
  const dm = await getDataManager();
  const submissions = dm.getSubmissions();

  const patterns = [/greatest hits/i, /best of/i, /the best of/i];
  const artists = new Set<string>();

  submissions.forEach(sub => {
    const album = (sub.album || '').trim();
    if (!album) return;
    if (patterns.some(p => p.test(album))) {
      artists.add(sub.artist.trim());
    }
  });

  return NextResponse.json({
    count: artists.size,
    artists: Array.from(artists).sort((a, b) => a.localeCompare(b)),
  });
}


