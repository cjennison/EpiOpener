# EpiOpener

FFXIV Opener Overlay for ACT - Display class openers with audio feedback and zone-aware adjustments.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Development

Dev server runs at `http://localhost:3000/`

### Testing in ACT

1. Start the dev server: `npm run dev`
2. In ACT: Plugins > OverlayPlugin.dll > New
3. Select "Custom" overlay, set URL to `http://localhost:3000/`
4. The overlay will display player info and respond to game events

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests with Vitest

## Tech Stack

- Vite + React + TypeScript
- Mantine UI
- Zustand (state management)
- OverlayPlugin API
- Vitest (testing)

## Project Status

See [MILESTONES.md](./docs/MILESTONES.md) for development progress.

Currently: **Milestone 1 Complete** - ACT integration working, dev environment ready.
