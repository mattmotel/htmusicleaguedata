'use client';

import { ReactNode, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps & MotionProps>(
  ({
    children,
    className = '',
    variant = 'default',
    size = 'md',
    interactive = false,
    disabled = false,
    onClick,
    role,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...motionProps
  }, ref) => {
    const baseClasses = 'relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900';
    
    const variantClasses = {
      default: 'bg-white/5 shadow-sm',
      elevated: 'bg-white/10 shadow-lg shadow-emerald-500/10',
      subtle: 'bg-white/2 shadow-sm',
      floating: 'bg-white/8 shadow-xl shadow-blue-500/20',
    };
    
    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };
    
    const interactiveClasses = interactive && !disabled
      ? 'cursor-pointer hover:bg-white/10 hover:border-white/20 hover:shadow-lg active:scale-[0.98]'
      : '';
    
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : '';

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        whileHover={interactive && !disabled ? { 
          scale: 1.02,
          y: -2,
          transition: { duration: 0.15 }
        } : {}}
        whileTap={interactive && !disabled ? { 
          scale: 0.98,
          transition: { duration: 0.1 }
        } : {}}
        onClick={interactive && !disabled ? onClick : undefined}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${interactiveClasses}
          ${disabledClasses}
          ${className}
        `}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        tabIndex={interactive && !disabled ? 0 : undefined}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;