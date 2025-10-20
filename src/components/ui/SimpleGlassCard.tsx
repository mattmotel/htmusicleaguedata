'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SimpleGlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export default function SimpleGlassCard({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  interactive = false,
}: SimpleGlassCardProps) {
  const baseClasses = 'backdrop-blur-sm border border-white/10 rounded-xl';
  
  const variantClasses = {
    default: 'bg-white/5',
    elevated: 'bg-white/10 shadow-lg',
    subtle: 'bg-white/2',
  };
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={interactive ? { 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:bg-white/10' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
