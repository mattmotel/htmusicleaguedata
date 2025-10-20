'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, List, AlertTriangle, Trophy, Search } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/submissions', label: 'All Submissions', icon: List },
  { href: '/missing-votes', label: 'Missing Votes', icon: AlertTriangle },
  { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
  { href: '/search', label: 'Search', icon: Search },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-green-400 rounded-md p-2">
                <span className="text-xl font-bold text-gray-900">🎵</span>
              </div>
              <span className="text-xl font-bold text-green-400">Hard Times Music League</span>
            </Link>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
