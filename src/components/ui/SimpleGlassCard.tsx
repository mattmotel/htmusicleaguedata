'use client';

import { ReactNode, forwardRef } from 'react';

interface SimpleGlassCardProps {
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

const SimpleGlassCard = forwardRef<HTMLDivElement, SimpleGlassCardProps>(
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
    ...props
  }, ref) => {
    const baseClasses = 'relative rounded-xl border border-gray-600/50 backdrop-blur-sm transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-gray-800/50',
      elevated: 'bg-gray-800/60 shadow-lg',
      subtle: 'bg-gray-800/30',
      floating: 'bg-gray-800/70 shadow-xl'
    };
    
    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };
    
    const interactiveClasses = interactive && !disabled 
      ? 'cursor-pointer hover:bg-gray-700/60 hover:border-gray-500/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50'
      : '';
    
    const disabledClasses = disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${interactiveClasses}
          ${disabledClasses}
          ${className}
        `}
        onClick={disabled ? undefined : onClick}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        tabIndex={interactive && !disabled ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SimpleGlassCard.displayName = 'SimpleGlassCard';

export default SimpleGlassCard;