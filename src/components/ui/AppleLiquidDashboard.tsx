'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import LiquidGlassCard from './LiquidGlassCard';
import AdaptiveButton from './AdaptiveButton';
import { DashboardData, DashboardConfig } from '../../lib/dashboard-config';

interface AppleLiquidDashboardProps {
  data: DashboardData;
  config: DashboardConfig;
  className?: string;
}

export default function AppleLiquidDashboard({
  data,
  config,
  className = '',
}: AppleLiquidDashboardProps) {
  const getIcon = (iconName: string): LucideIcon => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.BarChart3;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
      {/* Hero Section with Apple-style typography */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center py-16 px-4"
      >
        <motion.h1 
          className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {config.title}
        </motion.h1>
        <motion.p 
          className="text-xl text-slate-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {config.description}
        </motion.p>
      </motion.div>

      {/* Stats Grid with Liquid Glass */}
      <div className="container mx-auto px-4 pb-16">
        <div className={`grid grid-cols-1 sm:grid-cols-${config.layout.gridCols.sm} md:grid-cols-${config.layout.gridCols.md} lg:grid-cols-${config.layout.gridCols.lg} xl:grid-cols-${config.layout.gridCols.xl} gap-8`}>
          <AnimatePresence>
            {data.stats.map((stat, index) => {
              const IconComponent = getIcon(stat.icon);
              
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                >
                  <LiquidGlassCard
                    variant="elevated"
                    size="lg"
                    interactive
                    adaptive
                    specular
                    className="h-full"
                  >
                    <div className="flex flex-col h-full">
                      {/* Icon with Apple-style animation */}
                      <motion.div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${
                          stat.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20' :
                          stat.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                          stat.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                          stat.color === 'orange' ? 'from-orange-500/20 to-orange-600/20' :
                          stat.color === 'red' ? 'from-red-500/20 to-red-600/20' :
                          'from-pink-500/20 to-pink-600/20'
                        } mb-6`}
                        whileHover={{ 
                          rotate: 5,
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className={`${
                          stat.color === 'emerald' ? 'text-emerald-400' :
                          stat.color === 'blue' ? 'text-blue-400' :
                          stat.color === 'purple' ? 'text-purple-400' :
                          stat.color === 'orange' ? 'text-orange-400' :
                          stat.color === 'red' ? 'text-red-400' :
                          'text-pink-400'
                        }`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-300 mb-2">{stat.title}</h3>
                          {stat.description && (
                            <p className="text-sm text-slate-400 mb-4">{stat.description}</p>
                          )}
                        </div>
                        
                        <motion.div
                          className="text-4xl font-bold text-white"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          {stat.value.toLocaleString()}
                        </motion.div>
                        
                        {stat.trend && (
                          <motion.div
                            className={`flex items-center space-x-2 text-sm mt-2 ${
                              stat.trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <span>{stat.trend.isPositive ? '↗' : '↘'}</span>
                            <span>{Math.abs(stat.trend.value)}%</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Cards with Apple-style morphing */}
        <div className="mt-16">
          <motion.h2 
            className="text-3xl font-bold text-center text-white mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Explore
          </motion.h2>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${config.layout.gridCols.xl} gap-8`}>
            <AnimatePresence>
              {data.navigation.map((card, index) => {
                const IconComponent = getIcon(card.icon);
                
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.8 + index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      y: -12,
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <a href={card.href}>
                      <LiquidGlassCard
                        variant="floating"
                        size="lg"
                        interactive
                        adaptive
                        specular
                        className="h-full group"
                      >
                        <div className="flex flex-col items-center text-center space-y-6">
                          {/* Apple-style icon with morphing */}
                          <motion.div
                            className={`p-6 rounded-3xl bg-gradient-to-br ${
                              card.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20' :
                              card.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                              card.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                              card.color === 'orange' ? 'from-orange-500/20 to-orange-600/20' :
                              card.color === 'red' ? 'from-red-500/20 to-red-600/20' :
                              'from-pink-500/20 to-pink-600/20'
                            } group-hover:scale-110 transition-transform duration-300`}
                            whileHover={{ 
                              rotate: 10,
                              scale: 1.1,
                              transition: { duration: 0.3 }
                            }}
                          >
                            <div className={`${
                              card.color === 'emerald' ? 'text-emerald-400' :
                              card.color === 'blue' ? 'text-blue-400' :
                              card.color === 'purple' ? 'text-purple-400' :
                              card.color === 'orange' ? 'text-orange-400' :
                              card.color === 'red' ? 'text-red-400' :
                              'text-pink-400'
                            }`}>
                              <IconComponent className="w-10 h-10" />
                            </div>
                          </motion.div>
                          
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                              {card.description}
                            </p>
                          </div>
                          
                          {/* Apple-style arrow */}
                          <motion.div
                            className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ x: 5 }}
                          >
                            →
                          </motion.div>
                        </div>
                      </LiquidGlassCard>
                    </a>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer with Apple-style metadata */}
        <motion.div
          className="text-center text-sm text-slate-500 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Last updated: {new Date(data.metadata.lastUpdated).toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}
