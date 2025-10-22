// Shared Navigation Configuration
// Used across Navigation component, Homepage, and anywhere else nav items are needed

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string; // Lucide icon name
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'pink' | 'yellow';
  showInNav: boolean; // Show in top navigation bar
  showInHomepage: boolean; // Show on homepage cards
}

export const navigationItems: NavItem[] = [
  {
    id: 'leaderboards',
    label: 'Leaderboards',
    href: '/leaderboards',
    icon: 'Trophy',
    description: 'Rankings and statistics',
    color: 'blue',
    showInNav: true,
    showInHomepage: true,
  },
  {
    id: 'submissions',
    label: 'All Submissions',
    href: '/submissions',
    icon: 'List',
    description: 'Browse all submissions',
    color: 'emerald',
    showInNav: true,
    showInHomepage: true,
  },
  {
    id: 'seasons',
    label: 'Seasons',
    href: '/seasons',
    icon: 'Calendar',
    description: 'Season statistics and breakdown',
    color: 'purple',
    showInNav: true,
    showInHomepage: true,
  },
  {
    id: 'rounds',
    label: 'Rounds',
    href: '/rounds',
    icon: 'Hash',
    description: 'All round themes and idea generator',
    color: 'orange',
    showInNav: true,
    showInHomepage: true,
  },
  {
    id: 'artists',
    label: 'Artists',
    href: '/artists',
    icon: 'Users',
    description: 'View all artists',
    color: 'purple',
    showInNav: true,
    showInHomepage: true,
  },
  {
    id: 'missing-votes',
    label: 'Missing Votes',
    href: '/missing-votes',
    icon: 'AlertTriangle',
    description: 'Track participation',
    color: 'orange',
    showInNav: true,
    showInHomepage: true,
  },
  {
    id: 'search',
    label: 'Search',
    href: '/search',
    icon: 'Search',
    description: 'Search songs and artists',
    color: 'pink',
    showInNav: true,
    showInHomepage: true,
  },
];

// Helper functions to get filtered nav items
export const getNavBarItems = () => navigationItems.filter(item => item.showInNav);
export const getHomepageItems = () => navigationItems.filter(item => item.showInHomepage);
export const getAllNavItems = () => navigationItems;

