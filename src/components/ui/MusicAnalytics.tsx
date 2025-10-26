'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Area,
  AreaChart
} from 'recharts';

interface MusicAnalyticsProps {
  topArtists: Array<{
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submissionCount: number;
  }>;
  topSongs: Array<{
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
  }>;
  topSubmitters: Array<{
    name: string;
    totalPoints: number;
    submissions: number;
  }>;
}

// Top Artists by Total Points
function TopArtistsByPoints({ artists }: { artists: any[] }) {
  const data = artists.slice(0, 10).map(artist => ({
    name: artist.artist.length > 12 ? artist.artist.substring(0, 12) + '...' : artist.artist,
    points: artist.totalPoints,
    votes: artist.totalVotes,
    submissions: artist.submissionCount
  }));

  return (
    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
      <h3 className="text-emerald-400 font-bold text-lg mb-4">Top Artists by Points</h3>
      <p className="text-gray-400 text-sm mb-4">Highest scoring artists in the league</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            formatter={(value, name) => [value, 'Total Points']}
            labelFormatter={(label) => `Artist: ${label}`}
          />
          <Bar dataKey="points" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Most Points (Single Submission)
function MostVotesSingleSubmission({ topSongs }: { topSongs: any[] }) {
  const data = topSongs
    .map(song => ({
      name: song.title.length > 15 ? song.title.substring(0, 15) + '...' : song.title,
      artist: song.artist.length > 12 ? song.artist.substring(0, 12) + '...' : song.artist,
      submitter: song.submitter,
      season: song.season,
      round: song.round,
      points: song.totalPoints,
      votes: song.totalVotes
    }))
    .slice(0, 10); // Already sorted by points descending in the data preparation

  return (
    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 hover:border-orange-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
      <h3 className="text-orange-400 font-bold text-lg mb-4">Most Points (Single Submission)</h3>
      <p className="text-gray-400 text-sm mb-4">Individual song submissions with the most points</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            formatter={(value, name) => [value, name === 'points' ? 'Points' : 'Votes']}
            labelFormatter={(label) => {
              const song = data.find(s => s.name === label);
              return `${song?.name || label} by ${song?.artist} (S${song?.season}, R${song?.round} • ${song?.submitter})`;
            }}
          />
          <Bar dataKey="points" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Submitter Efficiency - Shows both raw and normalized averages
function SubmitterEfficiency({ submitters }: { submitters: any[] }) {
  const data = submitters
    .map(submitter => ({
      name: submitter.name.length > 12 ? submitter.name.substring(0, 12) + '...' : submitter.name,
      rawAvg: submitter.averagePoints || 0,
      normalizedAvg: submitter.equivalizedAveragePoints || 0,
      totalPoints: submitter.totalPoints,
      submissions: submitter.submissions
    }))
    .sort((a, b) => b.rawAvg - a.rawAvg)
    .slice(0, 10);

  return (
    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 hover:border-indigo-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
      <h3 className="text-indigo-400 font-bold text-lg mb-4">Submitter Efficiency</h3>
      <p className="text-gray-400 text-sm mb-4">Shows both raw average and normalized average points per submission</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            label={{ value: 'Avg Points', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            formatter={(value, name) => [value, name === 'rawAvg' ? 'Raw Avg' : 'Normalized Avg']}
            labelFormatter={(label) => `Submitter: ${label}`}
          />
          <Bar dataKey="rawAvg" fill="#6366f1" name="Raw Average" />
          <Bar dataKey="normalizedAvg" fill="#f59e0b" name="Normalized Average" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Average Points per Vote - Simple single bar
function AveragePointsPerVote({ artists }: { artists: any[] }) {
  const data = artists
    .map(artist => ({
      name: artist.artist.length > 12 ? artist.artist.substring(0, 12) + '...' : artist.artist,
      avgPointsPerVote: artist.totalVotes > 0 ? (artist.totalPoints / artist.totalVotes) : 0,
      totalVotes: artist.totalVotes,
      totalPoints: artist.totalPoints
    }))
    .sort((a, b) => b.avgPointsPerVote - a.avgPointsPerVote)
    .slice(0, 12);

  return (
    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
      <h3 className="text-green-400 font-bold text-lg mb-4">Average Points per Vote</h3>
      <p className="text-gray-400 text-sm mb-4">Shows which artists get the most points per vote</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            label={{ value: 'Avg Points', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            formatter={(value, name) => [value, 'Avg Points per Vote']}
            labelFormatter={(label) => `Artist: ${label}`}
          />
          <Bar dataKey="avgPointsPerVote" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Main Analytics Dashboard
export default function MusicAnalytics({ topArtists, topSongs, topSubmitters }: MusicAnalyticsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`transition-all duration-700 ease-out transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <TopArtistsByPoints artists={topArtists} />
        </div>
        <div className={`transition-all duration-700 ease-out transform delay-100 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <MostVotesSingleSubmission topSongs={topSongs} />
        </div>
        <div className={`transition-all duration-700 ease-out transform delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <SubmitterEfficiency submitters={topSubmitters} />
        </div>
        <div className={`transition-all duration-700 ease-out transform delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <AveragePointsPerVote artists={topArtists} />
        </div>
      </div>
    </div>
  );
}
