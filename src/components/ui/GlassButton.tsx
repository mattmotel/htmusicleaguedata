'use client';

import { ReactNode, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GlassButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps & MotionProps>(
  ({
    children,
    icon: Icon,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...motionProps
  }, ref) => {
    const baseClasses = 'relative overflow-hidden rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-lg hover:shadow-emerald-500/25',
      secondary: 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500',
      ghost: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white focus:ring-slate-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-red-500/25',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const disabledClasses = disabled || loading
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={disabled || loading ? undefined : onClick}
        whileHover={!disabled && !loading ? { 
          scale: 1.05,
          transition: { duration: 0.15 }
        } : {}}
        whileTap={!disabled && !loading ? { 
          scale: 0.95,
          transition: { duration: 0.1 }
        } : {}}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${disabledClasses}
          ${className}
        `}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...motionProps}
      >
        {/* Subtle glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
        
        <div className="relative flex items-center justify-center space-x-2">
          {loading ? (
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <>
              {Icon && <Icon className="w-4 h-4" />}
              <span>{children}</span>
            </>
          )}
        </div>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;
