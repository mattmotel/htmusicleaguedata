'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Music, Trophy, Search, Vote, TrendingUp, Activity } from 'lucide-react';
import StatCard from './ui/StatCard';
import GlassCard from './ui/GlassCard';
import LiquidButton from './ui/LiquidButton';
import CompetitorsModal from './CompetitorsModal';

interface ModernHomeDashboardProps {
  totalSubmissions: number;
  uniqueArtists: number;
  seasonsCount: number;
  uniqueCompetitorsCount: number;
  totalVotes: number;
  competitorsList: Array<{ id: string; name: string }>;
  config: {
    leagueName: string;
    branding: {
      emoji: string;
      primaryColor: string;
    };
    features: {
      debugPages: boolean;
      artistsPage: boolean;
    };
  };
}

export default function ModernHomeDashboard({
  totalSubmissions,
  uniqueArtists,
  seasonsCount,
  uniqueCompetitorsCount,
  totalVotes,
  competitorsList,
  config,
}: ModernHomeDashboardProps) {
  const [showCompetitorsModal, setShowCompetitorsModal] = useState(false);

  const stats = [
    {
      title: 'Total Submissions',
      value: totalSubmissions,
      icon: <Music className="w-6 h-6" />,
      color: 'emerald' as const,
      description: 'Songs submitted across all seasons',
    },
    {
      title: 'Unique Artists',
      value: uniqueArtists,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'blue' as const,
      description: 'Distinct artists featured',
    },
    {
      title: 'Seasons',
      value: seasonsCount,
      icon: <Trophy className="w-6 h-6" />,
      color: 'purple' as const,
      description: 'Competition seasons completed',
    },
    {
      title: 'Unique Competitors',
      value: uniqueCompetitorsCount,
      icon: <Users className="w-6 h-6" />,
      color: 'orange' as const,
      description: 'Active participants',
      interactive: true,
      onClick: () => setShowCompetitorsModal(true),
    },
    {
      title: 'Total Votes',
      value: totalVotes,
      icon: <Vote className="w-6 h-6" />,
      color: 'pink' as const,
      description: 'Votes cast across all seasons',
    },
  ];

  const navigationCards = [
    {
      title: 'All Submissions',
      description: 'Browse all song submissions across seasons',
      href: '/submissions',
      icon: <Music className="w-8 h-8" />,
      color: 'emerald',
    },
    {
      title: 'Leaderboards',
      description: 'Overall rankings and statistics',
      href: '/leaderboards',
      icon: <Trophy className="w-8 h-8" />,
      color: 'blue',
    },
    {
      title: 'Artists',
      description: 'View all artists and submission counts',
      href: '/artists',
      icon: <Activity className="w-8 h-8" />,
      color: 'purple',
    },
    {
      title: 'Missing Votes',
      description: 'Track participation and missing votes',
      href: '/missing-votes',
      icon: <Users className="w-8 h-8" />,
      color: 'orange',
    },
    {
      title: 'Search',
      description: 'Search songs, artists, and submissions',
      href: '/search',
      icon: <Search className="w-8 h-8" />,
      color: 'pink',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          {config.leagueName}
        </h1>
        <p className="text-xl text-slate-400">Data Dashboard & Analytics</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
              interactive={stat.interactive}
              onClick={stat.onClick}
            />
          </motion.div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {navigationCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <a href={card.href}>
              <GlassCard
                interactive
                className="h-full"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${
                      card.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20' :
                      card.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                      card.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                      card.color === 'orange' ? 'from-orange-500/20 to-orange-600/20' :
                      'from-pink-500/20 to-pink-600/20'
                    }`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`${
                      card.color === 'emerald' ? 'text-emerald-400' :
                      card.color === 'blue' ? 'text-blue-400' :
                      card.color === 'purple' ? 'text-purple-400' :
                      card.color === 'orange' ? 'text-orange-400' :
                      'text-pink-400'
                    }`}>
                      {card.icon}
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-400">{card.description}</p>
                  </div>
                </div>
              </GlassCard>
            </a>
          </motion.div>
        ))}
      </div>

      {/* Competitors Modal */}
      <CompetitorsModal
        isOpen={showCompetitorsModal}
        onClose={() => setShowCompetitorsModal(false)}
        competitors={competitorsList}
      />
    </div>
  );
}
