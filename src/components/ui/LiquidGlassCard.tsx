'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  adaptive?: boolean; // Apple's adaptive behavior
  specular?: boolean; // Specular highlights
  onHover?: () => void;
  onLeave?: () => void;
}

export default function LiquidGlassCard({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  interactive = false,
  adaptive = true,
  specular = true,
  onHover,
  onLeave,
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth following
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });
  
  // Transform for specular highlights
  const rotateX = useTransform(springY, [-300, 300], [15, -15]);
  const rotateY = useTransform(springX, [-300, 300], [-15, 15]);
  
  // Adaptive opacity based on content
  const adaptiveOpacity = useTransform(springX, [-300, 0, 300], [0.3, 0.8, 0.3]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!cardRef.current || !interactive) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    onLeave?.();
  };

  const baseClasses = 'relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl';
  
  const variantClasses = {
    default: 'bg-white/5 shadow-lg',
    elevated: 'bg-white/10 shadow-2xl shadow-emerald-500/10',
    subtle: 'bg-white/2 shadow-sm',
    floating: 'bg-white/8 shadow-xl shadow-blue-500/20',
  };
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={interactive ? { 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={onHover}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        rotateX: specular ? rotateX : 0,
        rotateY: specular ? rotateY : 0,
        opacity: adaptive ? adaptiveOpacity : 1,
      }}
    >
      {/* Liquid Glass Background Layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"
        style={{
          background: specular 
            ? `radial-gradient(circle at ${springX}px ${springY}px, rgba(255,255,255,0.3) 0%, transparent 50%)`
            : undefined,
        }}
        animate={{
          background: specular 
            ? `radial-gradient(circle at ${springX.get()}px ${springY.get()}px, rgba(255,255,255,0.3) 0%, transparent 50%)`
            : undefined,
        }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Specular Highlights */}
      {specular && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"
          style={{
            x: springX,
            y: springY,
            opacity: 0.6,
          }}
          animate={{
            x: springX.get(),
            y: springY.get(),
          }}
          transition={{ duration: 0.1 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Liquid Flow Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
        style={{
          transform: 'skewX(-15deg)',
        }}
      />
    </motion.div>
  );
}
