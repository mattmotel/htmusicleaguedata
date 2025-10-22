import { getDataManager } from '../../lib/data';
import { Music } from 'lucide-react';

export default async function GreatestHitsPage() {
  const dm = await getDataManager();
  const submissions = dm.getSubmissions();

  const patterns = [/greatest hits/i, /best of/i, /the best of/i];
  const artistsSet = new Set<string>();

  submissions.forEach(sub => {
    const album = (sub.album || '').trim();
    if (!album) return;
    if (patterns.some(p => p.test(album))) {
      artistsSet.add(sub.artist.trim());
    }
  });

  const artists = Array.from(artistsSet).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Greatest Hits / Best Of Artists</h1>
          <p className="text-gray-400">{artists.length.toLocaleString()} artists with &quot;Greatest Hits&quot; or &quot;Best Of&quot; albums</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {artists.length === 0 ? (
          <p className="text-gray-400">No matching artists found.</p>
        ) : (
          <div className="space-y-2">
            {artists.map((artist, index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div className="flex items-center">
                    <Music className="w-4 h-4 text-green-400 mr-2" />
                    <p className="font-medium text-white">{artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


