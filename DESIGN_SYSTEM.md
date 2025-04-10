# ReelRum Design System

This document outlines the design system for the ReelRum application, including color palette, typography, spacing, and component usage guidelines.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Usage Guidelines](#usage-guidelines)

## Color Palette

ReelRum uses a vibrant color palette centered around our brand colors:

### Primary Colors

- **Rum Orange** (`#FF9B3A`): Primary brand color, used for primary buttons, highlights, and key UI elements
- **Teal** (`#00E8DD`): Secondary brand color, used for accents and secondary actions

### Neutral Colors

- **Background**: White in light mode, dark gray in dark mode
- **Foreground**: Dark gray in light mode, white in dark mode
- **Muted**: Light gray for subtle backgrounds and disabled states
- **Border**: Medium gray for borders and dividers

### Semantic Colors

- **Success**: Green for success states and positive actions
- **Warning**: Yellow for warning states and cautionary actions
- **Destructive**: Red for error states and destructive actions
- **Info**: Blue for informational states

## Typography

ReelRum uses the Geist font family for a clean, modern look:

- **Geist Sans**: Primary font for all text content
- **Geist Mono**: Monospace font for code blocks and technical content

### Font Sizes

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

## Spacing

ReelRum uses a consistent spacing scale:

- **0**: 0px
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **5**: 1.25rem (20px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **10**: 2.5rem (40px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)
- **24**: 6rem (96px)

## Components

ReelRum uses a component library based on ShadCN UI with custom styling:

### Core Components

- **Button**: Used for actions and form submissions
- **Input**: Text input fields
- **Select**: Dropdown selection fields
- **Checkbox**: Multiple selection controls
- **Radio**: Single selection controls
- **Textarea**: Multi-line text input
- **Form**: Form layout and validation

### Layout Components

- **Card**: Container for content with consistent styling
- **Dialog**: Modal dialogs for focused interactions
- **Tabs**: Tabbed navigation for related content
- **Popover**: Contextual information and actions

### Data Display Components

- **Table**: Structured data display
- **Avatar**: User profile images
- **Badge**: Status indicators and labels
- **Carousel**: Image galleries and slideshows
- **Rating**: Star ratings for reviews

### Feedback Components

- **Alert**: Important messages and notifications
- **Toast**: Temporary notifications
- **Progress**: Loading and progress indicators

## Usage Guidelines

### Buttons

- **Primary**: Use for the main action on a page or in a form
- **Secondary**: Use for secondary actions
- **Outline**: Use for less prominent actions
- **Ghost**: Use for the least prominent actions
- **Destructive**: Use for actions that delete or remove data

### Forms

- Always use form validation with clear error messages
- Group related form fields together
- Use appropriate input types for different data types
- Provide clear labels for all form fields

### Responsive Design

- Use the container component for consistent page width
- Design for mobile-first, then adapt for larger screens
- Use responsive utilities for different screen sizes
- Test on multiple device sizes

### Accessibility

- Ensure sufficient color contrast
- Provide text alternatives for images
- Use semantic HTML elements
- Support keyboard navigation
- Test with screen readers

## Implementation

The design system is implemented using:

- Tailwind CSS for utility classes
- ShadCN UI for component primitives
- CSS variables for theming
- Class Variance Authority for component variants

To use the design system, import components from the `@/components/ui` directory and apply utility classes from Tailwind CSS.

```jsx
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <Button variant="primary" size="lg">
      Get Started
    </Button>
  )
}
```

For custom styling, use the `cn` utility function to combine classes:

```jsx
import { cn } from "@/lib/utils"

export function CustomComponent({ className }) {
  return (
    <div className={cn("bg-background p-4 rounded-lg", className)}>
      Content
    </div>
  )
}
```
