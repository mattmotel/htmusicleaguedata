'use client';

import { Submission } from '@/lib/data';
import { Play, ChevronDown, ChevronRight, Expand, Minimize } from 'lucide-react';
import { useState } from 'react';

interface SubmissionsTableProps {
  submissions: Submission[];
}

export default function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  // Group submissions by season and sort by round number
  const submissionsBySeason = submissions.reduce((acc, submission) => {
    if (!acc[submission.season]) {
      acc[submission.season] = [];
    }
    acc[submission.season].push(submission);
    return acc;
  }, {} as Record<number, Submission[]>);

  // Sort submissions within each season by round number
  Object.keys(submissionsBySeason).forEach(season => {
    submissionsBySeason[Number(season)].sort((a, b) => {
      // First sort by round number
      if (a.roundNumber !== b.roundNumber) {
        return a.roundNumber - b.roundNumber;
      }
      // Then by submission title for same round
      return a.title.localeCompare(b.title);
    });
  });

  const seasons = Object.keys(submissionsBySeason)
    .map(Number)
    .sort((a, b) => b - a); // Latest seasons first

  // State for expanded seasons (first season expanded by default)
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set([seasons[0]]) // First season expanded by default
  );

  const toggleSeason = (season: number) => {
    setExpandedSeasons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(season)) {
        newSet.delete(season);
      } else {
        newSet.add(season);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSeasons(new Set(seasons));
  };

  const collapseAll = () => {
    setExpandedSeasons(new Set());
  };

  return (
    <div className="space-y-8">
      {/* Expand/Collapse All Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={expandAll}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Expand className="w-4 h-4" />
          <span>Expand All</span>
        </button>
        <button
          onClick={collapseAll}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Minimize className="w-4 h-4" />
          <span>Collapse All</span>
        </button>
      </div>

      {seasons.map((season) => {
        const isExpanded = expandedSeasons.has(season);
        const seasonSubmissions = submissionsBySeason[season];
        
        return (
          <div key={season} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSeason(season)}
              className="w-full bg-gray-700 px-6 py-4 border-b border-gray-600 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white text-left">
                  Season {season} ({seasonSubmissions.length} submissions)
                </h3>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Song
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Album
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Round
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Submitter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Play
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {seasonSubmissions.map((submission, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {submission.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.artist}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.album}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex flex-col">
                            <span className="font-medium text-blue-400">{submission.roundName}</span>
                            {submission.roundNumber !== 999 && (
                              <span className="text-xs text-gray-500">Round {submission.roundNumber}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.submitterName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.spotifyUri && (
                            <a
                              href={submission.spotifyUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              <span>Play</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
