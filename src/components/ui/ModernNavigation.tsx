'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BarChart3, List, Trophy, AlertTriangle, Search, Users } from 'lucide-react';
import GlassCard from './GlassCard';
import LiquidButton from './LiquidButton';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface ModernNavigationProps {
  title: string;
  logo?: string;
  navItems: NavItem[];
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ModernNavigation({
  title,
  logo = '🥾',
  navItems,
  breakpoint = 'xl',
}: ModernNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const breakpointClass = {
    sm: 'sm:flex',
    md: 'md:flex',
    lg: 'lg:flex',
    xl: 'xl:flex',
  }[breakpoint];

  const hiddenClass = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
  }[breakpoint];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-xl font-bold text-white">{logo}</span>
              </motion.div>
              <span className="text-xl font-bold text-white">{title}</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className={`hidden ${breakpointClass} space-x-2`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={item.href}>
                    <GlassCard
                      variant={isActive ? 'elevated' : 'default'}
                      size="sm"
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : 'hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className={hiddenClass}>
            <LiquidButton
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              icon={isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`${hiddenClass} border-t border-white/10 bg-slate-900/95 backdrop-blur-md`}
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <GlassCard
                        variant={isActive ? 'elevated' : 'default'}
                        size="sm"
                        className={`transition-all duration-300 ${
                          isActive
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-slate-500 mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
