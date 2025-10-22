# Reusable Components Documentation

## Overview

This design system provides highly reusable, accessible, and performant components inspired by Apple's Liquid Glass design principles. All components are built with accessibility in mind and follow modern React patterns.

## Core Components

### GlassCard

A versatile glass morphism container with full accessibility support.

```tsx
import GlassCard from './ui/GlassCard';

<GlassCard
  variant="elevated"        // default | elevated | subtle | floating
  size="lg"                // sm | md | lg | xl
  interactive={true}        // Enables hover effects and click handling
  disabled={false}         // Disables interaction
  onClick={() => {}}       // Click handler
  role="button"            // ARIA role
  aria-label="Description" // Screen reader label
  aria-describedby="id"    // Additional description
>
  Content here
</GlassCard>
```

**Features:**
- ✅ Full accessibility support (ARIA labels, roles, keyboard navigation)
- ✅ Focus management with visible focus rings
- ✅ Smooth animations with Framer Motion
- ✅ Glass morphism effects with backdrop blur
- ✅ Responsive sizing
- ✅ Interactive states (hover, active, disabled)

### GlassButton

A performant button component with glass effects.

```tsx
import GlassButton from './ui/GlassButton';
import { Menu } from 'lucide-react';

<GlassButton
  variant="primary"        // primary | secondary | ghost | danger
  size="md"               // sm | md | lg
  disabled={false}        // Disables button
  loading={false}         // Shows loading spinner
  icon={Menu}            // Optional Lucide icon
  onClick={() => {}}     // Click handler
  type="button"          // HTML button type
  aria-label="Action"    // Screen reader label
>
  Button Text
</GlassButton>
```

**Features:**
- ✅ Semantic HTML button element
- ✅ Loading states with spinner animation
- ✅ Icon support with Lucide React
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Glass morphism overlay effects

### Navigation

A complete navigation component with mobile support.

```tsx
import Navigation from './ui/Navigation';

<Navigation />
```

**Features:**
- ✅ Responsive design (desktop/mobile)
- ✅ Mobile hamburger menu with smooth animations
- ✅ Keyboard navigation support
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Active state indication
- ✅ Smooth transitions

### PageHeader

A consistent header component for all pages.

```tsx
import PageHeader from './ui/PageHeader';

<PageHeader
  title="Page Title"
  description="Page description text"
/>
```

**Features:**
- ✅ Consistent gradient text styling
- ✅ Centered layout
- ✅ Responsive typography
- ✅ Reusable across all pages

### ReusableDashboard

A complete dashboard component that works with any data.

```tsx
import ReusableDashboard from './ui/ReusableDashboard';

<ReusableDashboard
  data={dashboardData}     // DashboardData object
  config={dashboardConfig} // DashboardConfig object
  onStatClick={(id) => {}} // Optional stat click handler
  onNavClick={(id) => {}}  // Optional nav click handler
  className="custom"       // Additional CSS classes
/>
```

**Features:**
- ✅ Data-driven configuration
- ✅ Responsive grid layout
- ✅ Interactive statistics
- ✅ Navigation cards
- ✅ Accessibility support
- ✅ Customizable themes
- ✅ Event handlers for interactions

## Accessibility Features

### Keyboard Navigation
- All interactive elements support keyboard navigation
- Tab order is logical and intuitive
- Focus indicators are clearly visible
- Escape key closes modals and menus

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and descriptions
- Role attributes where appropriate
- Live regions for dynamic content

### Focus Management
- Visible focus indicators
- Focus trapping in modals
- Focus restoration after interactions
- Logical tab order

## Usage Examples

### Basic Dashboard Setup

```tsx
import { createDashboardData, defaultDashboardConfig } from '../lib/dashboard-config';
import ReusableDashboard from '../components/ui/ReusableDashboard';

const MyDashboard = ({ data }) => {
  const dashboardData = createDashboardData(
    data,
    defaultDashboardConfig,
    statMappings,
    navMappings
  );

  return (
    <ReusableDashboard
      data={dashboardData}
      config={defaultDashboardConfig}
      onStatClick={(statId) => console.log('Stat clicked:', statId)}
      onNavClick={(navId) => console.log('Nav clicked:', navId)}
    />
  );
};
```

### Custom Glass Card

```tsx
import GlassCard from '../components/ui/GlassCard';

const CustomCard = () => (
  <GlassCard
    variant="elevated"
    size="lg"
    interactive
    onClick={() => console.log('Card clicked')}
    aria-label="Custom interactive card"
  >
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </GlassCard>
);
```

### Navigation with Custom Items

```tsx
import Navigation from '../components/ui/Navigation';

// Navigation automatically uses the config from getConfig()
// No additional setup needed - it's fully self-contained
```

## Configuration System

### Dashboard Configuration

```tsx
const dashboardConfig = {
  title: "My Dashboard",
  description: "Analytics & Insights",
  logo: "📊",
  theme: {
    primary: "#10b981",
    secondary: "#6366f1",
    accent: "#f59e0b"
  },
  layout: {
    gridCols: { sm: 1, md: 2, lg: 3, xl: 5 },
    spacing: "1.5rem"
  },
  features: {
    animations: true,
    glassMorphism: true,
    liquidDesign: true
  }
};
```

### Data Mapping

```tsx
const statMappings = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: 'Users',
    color: 'emerald',
    description: 'Active users'
  }
];

const navMappings = [
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'View detailed analytics',
    href: '/analytics',
    icon: 'BarChart3',
    color: 'blue'
  }
];
```

## Performance Optimizations

### Efficient Animations
- Uses Framer Motion for smooth, hardware-accelerated animations
- Reduced animation complexity for better performance
- Optimized re-renders with proper React patterns

### Glass Effects
- CSS backdrop-filter for native performance
- Minimal JavaScript calculations
- Efficient hover states

### Bundle Size
- Tree-shakeable components
- Minimal dependencies
- Optimized imports

## Browser Support

- ✅ Chrome 88+
- ✅ Firefox 87+
- ✅ Safari 14+
- ✅ Edge 88+

## Testing

### Accessibility Testing
- Screen reader testing with NVDA, JAWS, VoiceOver
- Keyboard navigation testing
- Color contrast validation
- Focus management testing

### Performance Testing
- Lighthouse audits
- Bundle size analysis
- Animation performance
- Memory usage monitoring

## Best Practices

### Component Usage
1. Always provide meaningful ARIA labels
2. Use semantic HTML elements
3. Test with keyboard navigation
4. Validate color contrast
5. Test with screen readers

### Performance
1. Use React.memo for expensive components
2. Implement proper loading states
3. Optimize animations for 60fps
4. Minimize re-renders

### Accessibility
1. Provide alternative text for images
2. Use proper heading hierarchy
3. Ensure sufficient color contrast
4. Test with assistive technologies

## Migration Guide

### From Old Components
1. Replace `div` containers with `GlassCard`
2. Update buttons to use `GlassButton`
3. Add proper ARIA labels
4. Test keyboard navigation
5. Validate accessibility

### Upgrading
1. Update component imports
2. Add missing accessibility attributes
3. Test with screen readers
4. Validate keyboard navigation
5. Check color contrast

## Troubleshooting

### Common Issues

**Glass effects not working:**
- Ensure browser supports backdrop-filter
- Check CSS vendor prefixes
- Verify Tailwind CSS is properly configured

**Accessibility issues:**
- Add missing ARIA labels
- Check keyboard navigation
- Test with screen readers
- Validate color contrast

**Performance issues:**
- Reduce animation complexity
- Optimize re-renders
- Check bundle size
- Monitor memory usage

### Debug Mode
Enable debug mode for development:

```tsx
// Add to your component
const isDebug = process.env.NODE_ENV === 'development';

if (isDebug) {
  console.log('Component props:', props);
}
```

## Future Enhancements

### Planned Features
- Theme customization tools
- Advanced animation controls
- Component playground
- Accessibility audit tools
- Performance monitoring

### Roadmap
- **Q1**: Enhanced accessibility features
- **Q2**: Advanced theming system
- **Q3**: Performance optimizations
- **Q4**: Developer tools and documentation
