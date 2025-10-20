'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SimpleGlassCard from './SimpleGlassCard';
import SimpleButton from './SimpleButton';
import { DashboardData, DashboardConfig } from '../../lib/dashboard-config';

interface EfficientDashboardProps {
  data: DashboardData;
  config: DashboardConfig;
  className?: string;
}

export default function EfficientDashboard({
  data,
  config,
  className = '',
}: EfficientDashboardProps) {
  const getIcon = (iconName: string): LucideIcon => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.BarChart3;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 ${className}`}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 px-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
          {config.title}
        </h1>
        <p className="text-lg text-slate-300">{config.description}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 pb-12">
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
                <SimpleGlassCard
                  variant="elevated"
                  size="lg"
                  interactive
                  className="h-full"
                >
                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${
                      stat.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20' :
                      stat.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                      stat.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                      stat.color === 'orange' ? 'from-orange-500/20 to-orange-600/20' :
                      stat.color === 'red' ? 'from-red-500/20 to-red-600/20' :
                      'from-pink-500/20 to-pink-600/20'
                    } mb-4`}>
                      <div className={`${
                        stat.color === 'emerald' ? 'text-emerald-400' :
                        stat.color === 'blue' ? 'text-blue-400' :
                        stat.color === 'purple' ? 'text-purple-400' :
                        stat.color === 'orange' ? 'text-orange-400' :
                        stat.color === 'red' ? 'text-red-400' :
                        'text-pink-400'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{stat.title}</h3>
                        {stat.description && (
                          <p className="text-sm text-slate-400 mb-4">{stat.description}</p>
                        )}
                      </div>
                      
                      <div className="text-3xl font-bold text-white">
                        {stat.value.toLocaleString()}
                      </div>
                      
                      {stat.trend && (
                        <div className={`flex items-center space-x-2 text-sm mt-2 ${
                          stat.trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <span>{stat.trend.isPositive ? '↗' : '↘'}</span>
                          <span>{Math.abs(stat.trend.value)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </SimpleGlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Cards */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Explore
          </h2>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${config.layout.gridCols.xl} gap-6`}>
            {data.navigation.map((card, index) => {
              const IconComponent = getIcon(card.icon);
              
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <a href={card.href}>
                    <SimpleGlassCard
                      variant="elevated"
                      size="lg"
                      interactive
                      className="h-full group"
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Icon */}
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${
                          card.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20' :
                          card.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                          card.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                          card.color === 'orange' ? 'from-orange-500/20 to-orange-600/20' :
                          card.color === 'red' ? 'from-red-500/20 to-red-600/20' :
                          'from-pink-500/20 to-pink-600/20'
                        } group-hover:scale-105 transition-transform duration-200`}>
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
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </SimpleGlassCard>
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 mt-12">
          Last updated: {new Date(data.metadata.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
