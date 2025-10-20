'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  color = 'emerald',
  size = 'md',
  interactive = false,
  onClick,
}: StatCardProps) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    pink: 'text-pink-400',
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={interactive ? { scale: 1.02 } : {}}
    >
      <GlassCard
        interactive={interactive}
        className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <motion.div
                className={`p-2 rounded-xl bg-white/10 ${colorClasses[color]}`}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
            <div>
              <h3 className="text-sm font-medium text-slate-400">{title}</h3>
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <motion.div
              className={`flex items-center space-x-1 text-sm ${
                trend.isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <AnimatedCounter
            value={value}
            className={`font-bold ${colorClasses[color]} ${textSizeClasses[size]}`}
          />
          {trend && (
            <motion.div
              className="text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              vs last period
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
