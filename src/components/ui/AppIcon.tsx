'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AppIconProps {
  emoji?: string;
  iconImage?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export default function AppIcon({ 
  emoji,
  iconImage,
  size = 'md', 
  className = '',
  animated = true 
}: AppIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      whileHover={animated ? { 
        scale: 1.05,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={animated ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
    >
      {iconImage ? (
        // For custom icon images, use the full container
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg">
          <Image 
            src={iconImage} 
            alt="App Icon" 
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <>
          {/* Clean Apple-style rounded square background for emoji */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
            {/* Simple glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
          </div>
          
          {/* Emoji content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <span className="drop-shadow-sm">
              {emoji}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
