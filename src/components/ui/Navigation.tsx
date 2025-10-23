'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { getConfig } from '../../lib/config';
import { getNavBarItems } from '../../lib/navigation-config';

interface NavItemWithIcon {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Convert navigation config to component-ready format
const navItems: NavItemWithIcon[] = getNavBarItems().map(item => {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon];
  return {
    href: item.href,
    label: item.label,
    icon: IconComponent,
    description: item.description,
  };
});

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const config = getConfig();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
            aria-label="Go to homepage"
          >
            <Image 
              src="/logo.png"
              alt="Hard Times Music League"
              width={48}
              height={48}

            />
            <span className="text-xl font-bold text-white">{config.leagueName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex space-x-2" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <GlassCard
                      variant={isActive ? 'elevated' : 'default'}
                      size="sm"
                      interactive
                      className={`transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : 'hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                      role="button"
                      aria-label={`${item.label} - ${item.description}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="xl:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl"
            role="navigation"
            aria-label="Mobile navigation"
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
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <GlassCard
                        variant={isActive ? 'elevated' : 'default'}
                        size="sm"
                        interactive
                        className={`transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                        }`}
                        role="button"
                        aria-label={`${item.label} - ${item.description}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {item.description}
                            </div>
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
    </nav>
  );
}
