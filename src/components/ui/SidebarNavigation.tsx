'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBar, 
  MusicNotes, 
  Trophy, 
  Calendar, 
  Hash, 
  Microphone, 
  Warning, 
  MagnifyingGlass,
  X,
  List as ListIcon,
  CaretDoubleLeft,
  CaretDoubleRight
} from '@phosphor-icons/react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: ChartBar, description: 'Dashboard and analytics' },
  { href: '/submissions', label: 'All Submissions', icon: MusicNotes, description: 'Browse all submissions' },
  { href: '/leaderboards', label: 'Leaderboards', icon: Trophy, description: 'Rankings and statistics' },
  { href: '/seasons', label: 'Seasons', icon: Calendar, description: 'Season statistics and breakdown' },
  { href: '/rounds', label: 'Rounds', icon: Hash, description: 'All round themes and idea generator' },
  { href: '/artists', label: 'Artists', icon: Microphone, description: 'View all artists' },
  { href: '/missing-votes', label: 'Missing Votes', icon: Warning, description: 'Track participation' },
  { href: '/search', label: 'Search', icon: MagnifyingGlass, description: 'Search songs and artists' },
];

type SidebarState = 'collapsed' | 'expanded';

export default function SidebarNavigation() {
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarState(sidebarState === 'expanded' ? 'collapsed' : 'expanded');
  };

  const getSidebarClasses = () => {
    const baseClasses = "fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl transition-all duration-300 z-50";
    
    return sidebarState === 'collapsed' 
      ? `${baseClasses} w-16` 
      : `${baseClasses} w-64`;
  };

  const getContentClasses = () => {
    // On mobile, no margin at all but add top padding for header
    if (window.innerWidth < 1024) {
      return "ml-0 pt-16";
    }
    return sidebarState === 'collapsed' ? "ml-16" : "ml-64";
  };

  // Apply margin to main content
  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.className = `transition-all duration-300 ${getContentClasses()}`;
    }
  }, [sidebarState]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.className = `transition-all duration-300 ${getContentClasses()}`;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarState]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Full height office column */}
      <div className={`${getSidebarClasses()} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Collapse button - HUG the left edge */}
          <div className="flex justify-start p-4">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              title={sidebarState === 'expanded' ? 'Collapse to icons' : 'Expand to full'}
            >
              {sidebarState === 'expanded' ? (
                <CaretDoubleLeft className="w-4 h-4 text-gray-300" />
              ) : (
                <CaretDoubleRight className="w-4 h-4 text-gray-300" />
              )}
            </button>

            {/* Mobile Close */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Logo and title - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-3 px-4 pb-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Hard Times Music League" 
                className="w-full h-full object-cover"
              />
            </div>
            {sidebarState === 'expanded' && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">Hard Times</span>
                <span className="text-lg font-bold text-white">Music League</span>
              </div>
            )}
          </div>
          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center transition-all duration-200 group ${
                    sidebarState === 'collapsed' 
                      ? 'justify-center px-2 py-2.5' 
                      : 'space-x-3 px-3 py-2.5'
                  } ${
                    isActive 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  title={sidebarState === 'collapsed' ? `${item.label}: ${item.description}` : undefined}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <IconComponent 
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-green-400' : 'text-gray-400 group-hover:text-white'
                      }`} 
                    />
                  </div>
                  
                  {sidebarState === 'expanded' && (
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-gray-400 truncate">{item.description}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {sidebarState === 'expanded' && (
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                Data Dashboard & Analytics
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header - Fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/logo.png" 
                alt="Hard Times Music League" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-bold text-white">Hard Times Music League</span>
          </div>
          
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
          >
            {isMobileOpen ? (
              <X className="w-4 h-4 text-gray-300" />
            ) : (
              <ListIcon className="w-4 h-4 text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}