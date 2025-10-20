'use client';

import { X, Users, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitors: Array<{ id: string; name: string }>;
}

export default function CompetitorsModal({ isOpen, onClose, competitors }: CompetitorsModalProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return competitors
      .filter(c => c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [competitors, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-green-400">Unique Competitors ({competitors.length})</h2>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search competitors..."
              className="w-full pl-9 pr-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">Showing {filtered.length} of {competitors.length}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map((c, index) => (
            <div key={c.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-400 text-gray-900 text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-white">{c.name}</span>
              </div>
              <span className="text-xs text-gray-400">{c.id}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">Close</button>
        </div>
      </div>
    </div>
  );
}


