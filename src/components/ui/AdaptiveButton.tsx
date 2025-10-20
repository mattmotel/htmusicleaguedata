'use client';

import { ReactNode, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AdaptiveButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  adaptive?: boolean; // Apple's adaptive behavior
  morphing?: boolean; // Dynamic morphing
  onClick?: () => void;
  className?: string;
}

export default function AdaptiveButton({
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  adaptive = true,
  morphing = true,
  onClick,
  className = '',
}: AdaptiveButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth following
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });
  
  // Simple hover effects
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!buttonRef.current || !adaptive || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseClasses = 'relative overflow-hidden rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-500 shadow-lg hover:shadow-emerald-500/25',
    secondary: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 focus:ring-slate-500',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white focus:ring-slate-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg hover:shadow-red-500/25',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus:ring-white/50',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  return (
    <motion.button
      ref={buttonRef}
      whileHover={!disabled ? { 
        scale: 1.05,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
      disabled={disabled}
      style={{}}
    >
      {/* Liquid Glass Background */}
      {morphing && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            transform: 'skewX(-15deg)',
          }}
        />
      )}
      
      {/* Specular Highlights */}
      {adaptive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent"
          style={{
            x: springX,
            y: springY,
            opacity: 0.4,
          }}
          animate={{
            x: springX.get(),
            y: springY.get(),
          }}
          transition={{ duration: 0.1 }}
        />
      )}
      
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
