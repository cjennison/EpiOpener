---
applyTo: "**/*.{tsx,css,scss,md}"
---

# Design System Guidelines

## Brand Identity & Visual Language

### Design Philosophy

- **Clean & Professional**: Minimalist approach with purposeful design elements
- **Modern & Accessible**: Contemporary UI patterns with universal usability
- **Content-First**: Design serves the content, not the other way around
- **Subtle Elegance**: Refined details that enhance without overwhelming

### Typography Hierarchy

#### Font Families

- **Primary (Display)**: `Inter` - Clean, modern sans-serif for headings and UI
- **Secondary (Body)**: `Inter` - Same family for consistency, different weights
- **Monospace**: `JetBrains Mono` - For code blocks and technical content

#### Font Scale

```css
/* Font sizes following 1.25 scale ratio */
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem; /* 36px */
--font-size-5xl: 3rem; /* 48px */
--font-size-6xl: 3.75rem; /* 60px */
```

#### Font Weights

- **Light**: 300 - Subtle text, secondary information
- **Normal**: 400 - Body text, default weight
- **Medium**: 500 - Emphasized text, navigation
- **Semibold**: 600 - Subheadings, buttons
- **Bold**: 700 - Main headings, strong emphasis

### Color System

#### Light Mode Palette

```css
/* Primary Colors - Deep Blue Trust Palette */
--color-primary-50: #f1f4f8; /* Lightest blue tint */
--color-primary-100: #e2e8f0; /* Very light blue */
--color-primary-200: #c5d1e0; /* Light blue */
--color-primary-300: #a8bad1; /* Medium light blue */
--color-primary-400: #8ba3c1; /* Medium blue */
--color-primary-500: #6e8cb2; /* Light blue */
--color-primary-600: #517595; /* Medium blue */
--color-primary-700: #3a5a7e; /* Blue */
--color-primary-800: #223a5e; /* Deep Blue - Main trust/headline color */
--color-primary-900: #1a2d47; /* Darkest blue */

/* Gold Accent Colors - Professional Gold */
--color-accent-50: #fdfcf9; /* Lightest gold tint */
--color-accent-100: #fbf8f0; /* Very light gold */
--color-accent-200: #f6f0e1; /* Light gold */
--color-accent-300: #f1e8d2; /* Medium light gold */
--color-accent-400: #ece0c3; /* Medium gold */
--color-accent-500: #e7d8b4; /* Light gold */
--color-accent-600: #d4c099; /* Medium gold */
--color-accent-700: #c2a54b; /* Gold Accent - Highlight/accent color */
--color-accent-800: #a08a3f; /* Dark gold */
--color-accent-900: #7e6f33; /* Darkest gold */

/* Neutral Colors - Professional Grays */
--color-neutral-50: #f5f6f8; /* Light Background Gray - Background surfaces */
--color-neutral-100: #f0f1f3; /* Very light gray */
--color-neutral-200: #e1e3e6; /* Light gray */
--color-neutral-300: #d2d4d8; /* Medium light gray */
--color-neutral-400: #c3c5ca; /* Medium gray */
--color-neutral-500: #9a9ca1; /* Gray */
--color-neutral-600: #7b7d82; /* Medium dark gray */
--color-neutral-700: #5c5e63; /* Dark gray */
--color-neutral-800: #4a4a4a; /* Dark Gray - Text bodies, secondary text */
--color-neutral-900: #2e2e2e; /* Darkest gray */

/* Semantic Colors */
--color-success: #10b981; /* Green for success states */
--color-warning: #f59e0b; /* Amber for warnings */
--color-error: #ef4444; /* Red for errors */
--color-info: #223a5e; /* Deep blue for information */
```

#### Dark Mode Palette

```css
/* Dark Mode - Adapted color hierarchy with warmer tones */
--color-primary-50: #1a2d47; /* Deep blue for dark backgrounds */
--color-primary-100: #223a5e; /* Deep Blue - Main trust color */
--color-primary-200: #3a5a7e; /* Blue */
--color-primary-300: #517595; /* Medium blue */
--color-primary-400: #6e8cb2; /* Light blue */
--color-primary-500: #223a5e; /* Keep primary consistent */
--color-primary-600: #8ba3c1; /* Medium blue */
--color-primary-700: #a8bad1; /* Medium light blue */
--color-primary-800: #c5d1e0; /* Light blue */
--color-primary-900: #e2e8f0; /* Very light blue for dark mode text */

/* Dark Gold Accent Colors */
--color-accent-50: #7e6f33; /* Darkest gold for backgrounds */
--color-accent-100: #a08a3f; /* Dark gold */
--color-accent-200: #c2a54b; /* Gold Accent - Main accent color */
--color-accent-300: #d4c099; /* Medium gold */
--color-accent-400: #e7d8b4; /* Light gold */
--color-accent-500: #c2a54b; /* Keep accent consistent */
--color-accent-600: #ece0c3; /* Medium gold */
--color-accent-700: #f1e8d2; /* Medium light gold */
--color-accent-800: #f6f0e1; /* Light gold */
--color-accent-900: #fbf8f0; /* Very light gold for dark mode highlights */

/* Dark Neutral Colors - Warmer grays for investment context */
--color-neutral-50: #1a1a1a; /* Deep background */
--color-neutral-100: #2e2e2e; /* Very dark */
--color-neutral-200: #3a3a3a; /* Dark */
--color-neutral-300: #4a4a4a; /* Dark Gray - Text bodies remain consistent */
--color-neutral-400: #5c5e63; /* Medium dark */
--color-neutral-500: #7b7d82; /* Medium */
--color-neutral-600: #9a9ca1; /* Light medium */
--color-neutral-700: #c3c5ca; /* Light */
--color-neutral-800: #e1e3e6; /* Very light */
--color-neutral-900: #f5f6f8; /* Light Background Gray for dark mode text */
```

#### Semantic Color System

```css
/* Light Mode Semantic Colors */
:root {
  --background: #ffffff;
  --foreground: #223a5e; /* Deep Blue for primary text */
  --surface: #f5f6f8; /* Light Background Gray */
  --surface-elevated: #ffffff;
  --border: #e1e3e6;
  --border-subtle: #f0f1f3;
  --text-primary: #223a5e; /* Deep Blue - Main trust/headline color */
  --text-secondary: #4a4a4a; /* Dark Gray - Text bodies, secondary text */
  --text-muted: #7b7d82;
  --text-placeholder: #9a9ca1;
  --accent-primary: #c2a54b; /* Gold Accent - Highlight/accent color */
  --accent-secondary: #d4c099;
}

/* Dark Mode Semantic Colors */
[data-theme="dark"] {
  --background: #1a1a1a;
  --foreground: #e2e8f0; /* Light blue for dark mode text */
  --surface: #2e2e2e;
  --surface-elevated: #3a3a3a;
  --border: #4a4a4a;
  --border-subtle: #3a3a3a;
  --text-primary: #e2e8f0; /* Light blue for dark mode headings */
  --text-secondary: #c3c5ca; /* Light gray for dark mode secondary text */
  --text-muted: #9a9ca1;
  --text-placeholder: #7b7d82;
  --accent-primary: #c2a54b; /* Gold Accent maintains consistency */
  --accent-secondary: #d4c099;
}
```

### Spacing System

#### Base Unit: 4px

```css
/* Spacing scale using 4px base unit */
--space-0: 0; /* 0px */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
--space-32: 8rem; /* 128px */
```

### Border Radius System

```css
/* Consistent border radius scale */
--radius-none: 0;
--radius-sm: 0.125rem; /* 2px */
--radius-base: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-full: 9999px; /* Fully rounded */
```

### Shadow System

```css
/* Elevation shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Dark mode shadows (softer) */
[data-theme="dark"] {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 /
          0.4);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.6);
}
```

### Component Design Patterns

#### Navigation

- **Clean horizontal layout** with subtle hover states
- **Active states** with accent color indicators
- **Smooth transitions** between states (200ms ease-out)
- **Responsive collapse** to hamburger menu on mobile

#### Cards & Content Containers

- **Subtle borders** with rounded corners (8px radius)
- **Layered shadows** for depth without heaviness
- **Hover states** with gentle elevation increase
- **Content padding** of 24px for comfortable reading

#### Buttons

- **Primary**: Solid background with primary color
- **Secondary**: Outline style with hover fill
- **Ghost**: Text-only with subtle hover background
- **Sizes**: Small (32px), Medium (40px), Large (48px) heights

#### Forms & Inputs

- **Clean borders** with focus states using primary color
- **Floating labels** for modern interaction
- **Error states** with red accent and descriptive text
- **Success states** with green accent for completion

### Layout Principles

#### Grid System

- **12-column grid** with consistent gutters
- **Responsive breakpoints**: Mobile (0px), Tablet (768px), Desktop (1024px), Wide (1280px)
- **Maximum content width**: 1200px with auto margins

#### Spacing Patterns

- **Section spacing**: 80px vertical between major sections
- **Component spacing**: 24px between related components
- **Text spacing**: 16px between paragraphs
- **List spacing**: 8px between list items

#### Visual Hierarchy

- **Page titles**: 48px, bold weight, primary color
- **Section headings**: 30px, semibold weight
- **Subsection headings**: 24px, medium weight
- **Body text**: 16px, normal weight, high contrast

### Animation & Transitions

#### Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Timing

- **Micro-interactions**: 150ms (hover, focus)
- **Component transitions**: 250ms (modal open/close)
- **Page transitions**: 400ms (route changes)

#### Motion Principles

- **Subtle entrance animations** from bottom with fade
- **Staggered animations** for list items (50ms delay)
- **Respect reduced motion** preference
- **Smooth scroll behavior** for navigation

### Accessibility Standards

#### Color Contrast

- **Text on background**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **Interactive elements**: Minimum 3:1 ratio for borders

#### Focus States

- **Visible focus rings** with 2px outline
- **High contrast colors** for focus indicators
- **Logical tab order** throughout interface

#### Typography Accessibility

- **Minimum font size**: 16px for body text
- **Maximum line length**: 70 characters
- **Line height**: 1.6 for body text, 1.2 for headings

### Implementation Guidelines

#### CSS Custom Properties Structure

```css
/* Mantine integrates with CSS custom properties automatically */
/* These are handled through Mantine's theme system */

:root {
  /* Mantine CSS variables are auto-generated based on theme configuration */
  --mantine-color-primary-0: #f1f4f8; /* Light blue tint */
  --mantine-color-primary-5: #6e8cb2; /* Medium blue */
  --mantine-color-primary-6: #517595; /* Primary blue */
  --mantine-color-primary-7: #3a5a7e; /* Darker blue */
  --mantine-color-primary-8: #223a5e; /* Deep Blue - Main trust color */

  --mantine-color-accent-0: #fdfcf9; /* Light gold tint */
  --mantine-color-accent-5: #e7d8b4; /* Medium gold */
  --mantine-color-accent-6: #d4c099; /* Gold */
  --mantine-color-accent-7: #c2a54b; /* Gold Accent - Main accent color */
  --mantine-color-accent-8: #a08a3f; /* Dark gold */

  /* Custom properties for advanced theming */
  --font-family-sans: "Inter", system-ui, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", monospace;
}

/* Example Mantine theme configuration */
import { createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    primary: [
      '#f1f4f8', '#e2e8f0', '#c5d1e0', '#a8bad1', '#8ba3c1',
      '#6e8cb2', '#517595', '#3a5a7e', '#223a5e', '#1a2d47'
    ],
    accent: [
      '#fdfcf9', '#fbf8f0', '#f6f0e1', '#f1e8d2', '#ece0c3',
      '#e7d8b4', '#d4c099', '#c2a54b', '#a08a3f', '#7e6f33'
    ],
    neutral: [
      '#f5f6f8', '#f0f1f3', '#e1e3e6', '#d2d4d8', '#c3c5ca',
      '#9a9ca1', '#7b7d82', '#5c5e63', '#4a4a4a', '#2e2e2e'
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
});
```

#### Component Theming Pattern

```tsx
// Example button component with Mantine theme support
import { Button, createTheme } from '@mantine/core';

const theme = createTheme({
  components: {
    Button: Button.extend({
      styles: (theme) => ({
        root: {
          fontWeight: 500,
          transition: 'all 200ms ease',
          '&:focus-visible': {
            outline: `2px solid ${theme.colors.primary[8]}`, // Deep Blue focus
            outlineOffset: '2px',
          },
          '&:disabled': {
            opacity: 0.5,
            pointerEvents: 'none',
          },
        },
      }),
      variants: {
        primary: (theme) => ({
          root: {
            backgroundColor: theme.colors.primary[8], // Deep Blue
            color: theme.white,
            '&:hover': {
              backgroundColor: theme.colors.primary[7], // Darker blue on hover
            },
          },
        }),
        secondary: (theme) => ({
          root: {
            border: `2px solid ${theme.colors.primary[8]}`, // Deep Blue border
            backgroundColor: 'transparent',
            color: theme.colors.primary[8], // Deep Blue text
            '&:hover': {
              backgroundColor: theme.colors.primary[0], // Light blue background on hover
            },
          },
        }),
        accent: (theme) => ({
          root: {
            backgroundColor: theme.colors.accent[7], // Gold Accent
            color: theme.white,
            '&:hover': {
              backgroundColor: theme.colors.accent[8], // Darker gold on hover
            },
          },
        }),
        ghost: (theme) => ({
          root: {
            backgroundColor: 'transparent',
            color: theme.colors.neutral[8], // Dark Gray text
            '&:hover': {
              backgroundColor: theme.colors.neutral[0], // Light Background Gray on hover
            },
          },
        }),
      },
    }),
  },
});

// Usage with Mantine components
<Button variant="primary" size="md">Primary Button</Button>
<Button variant="secondary" size="lg">Secondary Button</Button>
<Button variant="accent" size="md">Accent Button</Button>
<Button variant="ghost" size="sm">Ghost Button</Button>
```

### Brand Application

#### Logo & Identity

- **Minimalist approach** with clean typography
- **Monochrome variations** for different contexts
- **Proper spacing** around logo (minimum clear space = logo height)

#### Iconography

- **Consistent style**: Outline icons with 2px stroke width
- **24px default size** with 16px and 32px variations
- **Semantic usage** with proper ARIA labels

#### Content Photography

- **High quality images** with consistent processing
- **Proper aspect ratios**: 16:9 for hero, 4:3 for content, 1:1 for profiles
- **Alt text requirements** for all images

This design system creates a professional, modern portfolio interface that feels familiar and trustworthy while maintaining unique character through careful color choices and typography.
