'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ArtistSearchData {
  foundScatmanArtists: string[];
  relatedArtists: string[];
  totalArtists: number;
  sampleArtists: string[];
  exactMatchCount: number;
  exactMatchSubmissions: Array<{
    title: string;
    artist: string;
    submitter: string;
    season: number;
    round: number;
  }>;
}

export default function DebugArtistSearchPage() {
  const [data, setData] = useState<ArtistSearchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/debug-artist-search');
        if (!response.ok) {
          throw new Error('Failed to fetch artist search data');
        }
        const searchData = await response.json();
        setData(searchData);
      } catch (error) {
        console.error('Error loading artist search data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Artist Search Debug</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Artist Search Debug</h1>
          <p className="text-gray-400">No data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/leaderboards" className="text-green-400 hover:text-green-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Artist Search Debug</h1>
          <p className="text-gray-400">Finding the correct artist name for Scatman</p>
        </div>
      </div>

      {/* Exact Match Results */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Exact Match for &quot;Scatman John, Lou Bega&quot;</h2>
        <p className="text-gray-400 mb-4">Found {data.exactMatchCount} submissions with exact artist name match</p>
        {data.exactMatchSubmissions.length > 0 ? (
          <div className="space-y-3">
            {data.exactMatchSubmissions.map((submission, index) => (
              <div key={index} className="bg-gray-700 rounded p-4">
                <p className="font-medium text-white">{submission.title}</p>
                <p className="text-gray-300">Artist: {submission.artist}</p>
                <p className="text-gray-400">Submitted by: {submission.submitter}</p>
                <p className="text-gray-400">Season {submission.season}, Round {submission.round}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No exact matches found for &quot;Scatman John, Lou Bega&quot;</p>
        )}
      </div>

      {/* Found Scatman Artists */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Found Scatman Artists</h2>
        {data.foundScatmanArtists.length > 0 ? (
          <div className="space-y-2">
            {data.foundScatmanArtists.map((artist, index) => (
              <div key={index} className="bg-gray-700 rounded p-3">
                <p className="font-medium text-white">{artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No artists found containing &quot;Scatman&quot; or &quot;Lou Bega&quot;</p>
        )}
      </div>

      {/* Related Artists */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Related Artists</h2>
        {data.relatedArtists.length > 0 ? (
          <div className="space-y-2">
            {data.relatedArtists.map((artist, index) => (
              <div key={index} className="bg-gray-700 rounded p-3">
                <p className="font-medium text-white">{artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No related artists found</p>
        )}
      </div>

      {/* Sample Artists */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Sample Artists (First 20)</h2>
        <p className="text-gray-400 mb-4">Total artists in database: {data.totalArtists.toLocaleString()}</p>
        <div className="space-y-2">
          {data.sampleArtists.map((artist) => (
            <div key={artist} className="bg-gray-700 rounded p-3">
              <p className="font-medium text-white">{artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
