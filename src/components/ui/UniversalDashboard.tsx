'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import StatCard from './StatCard';
import GlassCard from './GlassCard';
import { DashboardData, DashboardConfig } from '../../lib/dashboard-config';

interface UniversalDashboardProps {
  data: DashboardData;
  config: DashboardConfig;
  className?: string;
}

export default function UniversalDashboard({
  data,
  config,
  className = '',
}: UniversalDashboardProps) {
  const getIcon = (iconName: string): LucideIcon => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.BarChart3;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          {config.title}
        </h1>
        <p className="text-xl text-slate-400">{config.description}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-${config.layout.gridCols.sm} md:grid-cols-${config.layout.gridCols.md} lg:grid-cols-${config.layout.gridCols.lg} xl:grid-cols-${config.layout.gridCols.xl} gap-6`}>
        {data.stats.map((stat, index) => {
          const IconComponent = getIcon(stat.icon);
          
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={<IconComponent className="w-6 h-6" />}
                color={stat.color}
                description={stat.description}
                trend={stat.trend}
                interactive={stat.interactive}
                onClick={stat.onClick ? () => {
                  // Handle dynamic onClick actions
                  if (stat.onClick.startsWith('/')) {
                    window.location.href = stat.onClick;
                  } else {
                    // Could be a function name or other action
                    console.log('Action:', stat.onClick);
                  }
                } : undefined}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${config.layout.gridCols.xl} gap-6`}>
        {data.navigation.map((card, index) => {
          const IconComponent = getIcon(card.icon);
          
          return (
            <motion.div
              key={card.id}
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
                        card.color === 'red' ? 'from-red-500/20 to-red-600/20' :
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
                        card.color === 'red' ? 'text-red-400' :
                        'text-pink-400'
                      }`}>
                        <IconComponent className="w-8 h-8" />
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
          );
        })}
      </div>

      {/* Metadata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-slate-500"
      >
        Last updated: {new Date(data.metadata.lastUpdated).toLocaleString()}
      </motion.div>
    </div>
  );
}
