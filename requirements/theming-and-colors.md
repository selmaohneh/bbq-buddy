# Feature: Theming and Color System

## Overview

BBQ Buddy implements a comprehensive theming system built on Tailwind CSS 4's @theme inline feature combined with next-themes for dynamic light/dark mode switching. The design uses a warm, BBQ-inspired brand color palette anchored by #D64933 (a red-orange hue) as the primary accent, with CSS custom properties defined in app/globals.css providing semantic color tokens (--background, --foreground, --card-background, --input-background, --border) that automatically adapt between light and dark modes via the data-theme attribute. The system integrates Geist Sans and Geist Mono fonts from next/font/google, inline SVG icons for UI elements (sun/moon for theme toggle, calendar icons, image placeholders), and the Sonner toast library for notifications that respect the active theme. Theme preferences are persisted to localStorage via next-themes, with automatic system preference detection, and the ThemeProvider wraps the entire application in app/layout.tsx to ensure consistent styling across all components while preventing flash-of-unstyled-content during hydration.

## User Stories

- As a BBQ enthusiast, I want to see a visually appealing red-orange brand color (#D64933) throughout the app so that it feels connected to BBQ and grilling culture
- As a user, I want to toggle between light and dark themes by clicking the sun/moon icon in the navigation bar so that I can use the app comfortably in different lighting conditions
- As a user with system dark mode preferences, I want the app to automatically detect and apply my preferred theme when I first visit so that I don't need to manually configure it
- As a user, I want my theme preference to persist between sessions so that I don't have to reselect my preferred theme every time I open the app
- As a user viewing the app at night, I want dark mode to use appropriate contrast ratios and darker backgrounds (#1a1a1a for background, #262626 for cards) so that the interface is comfortable to view without eye strain
- As a user viewing the app during the day, I want light mode to use soft, warm backgrounds (#eee5e9 for background, #ffffff for cards) so that the interface feels inviting and matches the BBQ theme
- As a user reading session cards and forms, I want text colors to automatically adjust for proper contrast (--foreground: #3E3E3E in light, #f5f5f5 in dark) so that content is always readable
- As a user interacting with form inputs, I want input fields to have theme-appropriate backgrounds (#f4f4f5 in light, #404040 in dark) and borders (#e4e4e7 in light, #404040 in dark) so that form controls are clearly visible
- As a user receiving notifications, I want toast messages to automatically match the current theme (light/dark/system) with rich colors and a close button so that notifications feel integrated with the app
- As a user with accessibility needs, I want the theme toggle button to include proper aria-labels ("Toggle Dark Mode") so that screen readers can announce its purpose
- As a user on a slow connection, I want the theme to be applied without visible flashing or layout shifts during page load so that the experience feels polished and professional
- As a developer, I want semantic CSS variables (--background, --primary, etc.) mapped to Tailwind utility classes (bg-background, text-primary) via @theme inline so that I can use consistent design tokens throughout components
- As a developer, I want Geist Sans as the default sans-serif font and Geist Mono for monospaced content so that typography matches modern web app standards
- As a PWA user installing the app, I want the manifest to declare the theme color (#D64933) and background color (#eee5e9) so that the browser chrome and splash screen match the app's visual identity
- As a user, I want inline SVG icons for common UI elements (theme toggle, calendar, image placeholders) so that icons render crisply at any size and adapt to theme colors
- As a user navigating the app, I want the navbar to consistently use the primary brand color (#D64933) with white text so that the header stands out and provides clear wayfinding
- As a user viewing session cards, I want hover effects (shadow transitions) that respect the current theme so that interactive elements feel responsive without visual jarring
- As a developer integrating new components, I want the theme context available via useTheme() from next-themes so that custom components can react to theme changes programmatically
