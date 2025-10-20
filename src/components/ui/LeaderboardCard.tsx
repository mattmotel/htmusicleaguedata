'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface LeaderboardCardProps {
  children: ReactNode;
  className?: string;
}

export default function LeaderboardCard({ children, className = '' }: LeaderboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard variant="elevated" size="lg" className={className}>
        {children}
      </GlassCard>
    </motion.div>
  );
}
