# ReelRum Styling Setup

This document provides an overview of the styling setup for the ReelRum application.

## Component Library

We've implemented a comprehensive UI component library based on ShadCN UI components and Tailwind CSS. The components are designed to be reusable, accessible, and consistent with the ReelRum brand.

### Components Implemented

1. **Layout Components**
   - Card - For content containers
   - Dialog - For modal dialogs
   - Popover - For tooltips and popovers
   - Separator - For dividing content sections
   - Tabs - For tabbed interfaces

2. **Form Components**
   - Button - For actions
   - Checkbox - For multiple selections
   - DatePicker - For date selection
   - Dropdown - For dropdown menus
   - Input - For text input
   - Label - For form labels
   - Select - For dropdown selections
   - Textarea - For multiline text input
   - Toggle - For on/off switches

3. **Data Display Components**
   - Avatar - For user profile images
   - Badge - For status indicators
   - Calendar - For date display
   - Carousel - For image galleries
   - Progress - For loading indicators
   - Rating - For review ratings
   - Skeleton - For loading states
   - Table - For structured data

4. **Feedback Components**
   - Alert - For important messages
   - Toaster - For toast notifications

5. **Theme Components**
   - ThemeProvider - For managing light/dark mode
   - ThemeToggle - For switching between themes

## Theming

The application uses a custom theme with the following features:

1. **Color Palette**
   - Primary colors: Rum Orange (#FF9B3A) and Teal (#00E8DD)
   - Semantic colors for success, warning, error, and info states
   - Neutral colors for backgrounds, text, and borders

2. **Typography**
   - Geist Sans for regular text
   - Geist Mono for code and technical content

3. **Dark Mode Support**
   - Implemented using next-themes
   - Supports light, dark, and system preferences

## Utility Functions

We've added several utility functions to support the component library:

1. **Styling Utilities**
   - `cn()` - For combining class names

2. **Formatting Utilities**
   - `formatPrice()` - For formatting currency values
   - `formatDate()` - For formatting dates
   - `parseDate()` - For parsing date strings
   - `getInitials()` - For generating initials from names
   - `truncateText()` - For truncating long text

3. **File Utilities**
   - `fileToDataUrl()` - For converting files to data URLs

4. **Performance Utilities**
   - `debounce()` - For debouncing function calls

## Implementation Details

1. **Tailwind Configuration**
   - Custom colors for the ReelRum brand
   - Extended theme with custom spacing, typography, and other design tokens

2. **Global Styles**
   - Base styles in globals.css
   - CSS variables for theme values

3. **Component Architecture**
   - Modular components with clear interfaces
   - Consistent naming conventions
   - Accessible by default

## Usage Guidelines

For detailed usage guidelines, please refer to the [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) document, which provides comprehensive documentation on how to use the components and apply the design system consistently across the application.

## Next Steps

1. **Component Testing**
   - Implement unit tests for components
   - Test accessibility compliance

2. **Documentation**
   - Create a Storybook or similar documentation site
   - Add more examples and usage patterns

3. **Refinement**
   - Gather feedback on component usability
   - Refine components based on real-world usage
