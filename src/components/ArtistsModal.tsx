'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface ArtistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: [string, number][];
}

export default function ArtistsModal({ isOpen, onClose, artists }: ArtistsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredArtists = artists.filter(([artist]) =>
    artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-green-400">
            All Artists ({artists.length.toLocaleString()})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Showing {filteredArtists.length.toLocaleString()} of {artists.length.toLocaleString()} artists
          </p>
        </div>

        {/* Artists List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredArtists.map(([artist, count], index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{count}</p>
                  <p className="text-sm text-gray-400">submissions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
