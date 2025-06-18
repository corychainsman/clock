# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a 3D analog clock application built with React, Three.js, and Vite. The clock is rendered in 3D using React Three Fiber (@react-three/fiber) with interactive controls powered by Tweakpane.

### Key Components Structure

- **App.tsx**: Main application component that manages clock configuration state and renders the 3D canvas
- **Clock.tsx**: Core 3D clock component composed of multiple sub-components (ClockFace, ClockHands, HourNumbers, MinuteNumbers, TickMarks)
- **ClockControls.tsx**: Interactive control panel using Tweakpane for real-time customization of colors and radii
- **types/clock.ts**: TypeScript definitions for clock configuration, including ClockColors, ClockRadii, and ClockConfig interfaces

### 3D Rendering Architecture

The clock uses an orthographic camera positioned at [0, 0, 10] with zoom level 90. All clock elements are positioned in 3D space using Three.js geometries:
- Clock face: CircleGeometry with configurable background color
- Clock hands: BoxGeometry positioned and rotated based on current time
- Numbers and tick marks: Positioned using polar coordinates with configurable radii
- Text rendering: Uses @react-three/drei Text component for hour/minute numbers

### Configuration System

The application uses a centralized configuration system where:
- All visual properties (colors, radii) are stored in a single ClockConfig object
- Default values are defined in types/clock.ts as DEFAULT_COLORS and DEFAULT_RADII
- Configuration is managed via React state in App.tsx and passed down to components
- Real-time updates are handled through Tweakpane controls

### Deployment

The project is configured for GitHub Pages deployment with base path "/clock/" set in vite.config.ts.