# Party Planner App

A browser-based party planning application built with React, TypeScript, and Tailwind CSS.

## Project Structure

- React components (one per file)
- TypeScript for type safety
- Tailwind CSS for styling
- Files kept under 250 lines each

## Features

- Pizza estimator: Calculate number of pizzas needed based on guest count

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Preview production build locally
npm run preview
```

## Deployment

This app is configured for GitHub Pages deployment:

1. Push to main branch triggers automatic deployment via GitHub Actions
2. The app will be available at: `https://[username].github.io/pary-planner/`
3. GitHub Pages must be enabled in repository settings with source set to "GitHub Actions"

## Component Guidelines

- One React component per file
- Use TypeScript interfaces for props
- Keep files under 250 lines
- Use Tailwind CSS for styling