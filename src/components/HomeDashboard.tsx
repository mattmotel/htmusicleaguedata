'use client';

import { useState } from 'react';
import { Music, Users, Trophy, Vote, BarChart3 } from 'lucide-react';
import CompetitorsModal from './CompetitorsModal';

interface CompetitorItem {
  id: string;
  name: string;
}

interface HomeDashboardProps {
  totalSubmissions: number;
  uniqueArtists: number;
  seasonsCount: number;
  uniqueCompetitors: number;
  totalVotes: number;
  competitorsList: CompetitorItem[];
}

export default function HomeDashboard({
  totalSubmissions,
  uniqueArtists,
  seasonsCount,
  uniqueCompetitors,
  totalVotes,
  competitorsList,
}: HomeDashboardProps) {
  const [isCompetitorsOpen, setIsCompetitorsOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold text-green-400">{totalSubmissions.toLocaleString()}</p>
            </div>
            <Music className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Artists</p>
              <p className="text-2xl font-bold text-green-400">{uniqueArtists.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Seasons</p>
              <p className="text-2xl font-bold text-green-400">{seasonsCount}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Competitors</p>
              <button
                className="text-2xl font-bold text-green-400 underline decoration-dotted hover:text-green-300"
                onClick={() => setIsCompetitorsOpen(true)}
              >
                {uniqueCompetitors}
              </button>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Votes</p>
              <p className="text-2xl font-bold text-green-400">{totalVotes.toLocaleString()}</p>
            </div>
            <Vote className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      <CompetitorsModal
        isOpen={isCompetitorsOpen}
        onClose={() => setIsCompetitorsOpen(false)}
        competitors={competitorsList}
      />
    </>
  );
}


