# EpiOpener Development Milestones

This document outlines the development approach for the EpiOpener overlay project - a custom ACT overlay for displaying FFXIV openers with audio feedback.

## Project Overview

**Goal**: Create a lightweight, visually appealing overlay that displays class-specific openers for FFXIV, with audio feedback, zone-aware adjustments, and user-configurable settings.

**Tech Stack**:

- Vite + React + TypeScript
- Mantine UI (for configuration interface)
- OverlayPlugin API integration
- Local Storage for persistence
- Vercel for production hosting

---

## Milestone 1: Project Foundation & ACT Integration

**Objective**: Set up the project infrastructure and establish communication with ACT's OverlayPlugin.

### Tasks

1. **Initialize Vite + React + TypeScript Project**

   - Configure Vite for optimal bundle size
   - Set up TypeScript with strict mode
   - Configure ESLint and Prettier
   - Set up project structure following architecture guidelines

2. **OverlayPlugin Integration Layer**

   - Include OverlayPlugin's `common.min.js` for API access
   - Create service layer for ACT event handling
   - Implement event listeners:
     - `ChangePrimaryPlayer` - detect player job changes
     - `ChangeZone` - detect zone/instance changes
     - `LogLine` - track combat actions for opener progression
     - `CombatData` - detect combat state
   - Create TypeScript types for all ACT events

3. **Core State Management**
   - Set up Zustand store for global state
   - Implement player state tracking (job, zone, combat status)
   - Create opener progression state management

### Deliverables

- Working Vite dev server loadable in ACT
- Console logging of ACT events (player job, zone changes, combat actions)
- TypeScript interfaces for all ACT event data

### Acceptance Criteria

- Overlay loads in ACT Custom Overlay without errors
- Job detection works when switching classes in-game
- Zone detection works when changing zones
- Combat start/end detection works

---

## Milestone 2: Opener Data Model & Action Detection

**Objective**: Design and implement the opener data model and action detection system.

### Tasks

1. **Opener Data Model Design**

   - Create JSON schema for opener definitions
   - Support for:
     - GCD abilities (with timing)
     - oGCD abilities (weaving positions)
     - Conditional branches (proc-based openers)
     - Audio cue references
     - Visual asset key IDs
   - Document schema for AI-assisted opener creation

2. **Action Detection System**

   - Parse LogLine events for ability usage
   - Map ability IDs to action names
   - Track GCD/oGCD timing windows
   - Implement opener sequence matching logic

3. **Sample Opener Data**
   - Create 2-3 sample openers for testing (e.g., WAR, BLM)
   - Include varied complexity (simple vs. branching)

### Data Model Example

```json
{
  "id": "war-standard-dt",
  "job": "WAR",
  "name": "Standard Dawntrail Opener",
  "version": "7.0",
  "zone": null,
  "actions": [
    {
      "id": "tomahawk",
      "name": "Tomahawk",
      "type": "gcd",
      "position": 1,
      "iconId": "000261"
    },
    {
      "id": "infuriate",
      "name": "Infuriate",
      "type": "ogcd",
      "position": 1,
      "weaveSlot": 1,
      "iconId": "002555"
    }
  ],
  "audioEnabled": true
}
```

### Deliverables

- TypeScript interfaces for opener data model
- JSON schema documentation
- Action detection service
- Sample opener JSON files
- AI prompt template for creating opener JSON from images

### Acceptance Criteria

- Actions are detected from LogLine events
- Opener progression updates correctly as actions are used
- Sample openers load and parse correctly

---

## Milestone 3: Visual Timeline Component

**Objective**: Create the visual opener timeline display matching TheBalance style.

### Tasks

1. **Timeline Component Architecture**

   - Create main `OpenerTimeline` component
   - Implement `ActionIcon` component for individual abilities
   - Create `GCDSlot` component grouping GCD + weaved oGCDs
   - Implement progression indicator (current action highlight)

2. **Visual Design Implementation**

   - Transparent background (overlay-friendly)
   - Action icons with proper sizing and spacing
   - GCD/oGCD visual differentiation
   - Current action highlight/glow effect
   - Completed action checkmark/dim effect
   - Responsive scaling for different resolutions

3. **Animation & Transitions**
   - Smooth progression animations
   - Action completion feedback
   - Error state indication (missed action)

### Visual Layout

```
[Pre-pull] → [GCD1 + oGCD] → [GCD2 + oGCD + oGCD] → [GCD3] → ...
    ↑
 Current
```

### Deliverables

- `OpenerTimeline` React component
- `ActionIcon` component with state variants
- `GCDSlot` grouping component
- CSS animations for progression feedback
- Responsive design implementation

### Acceptance Criteria

- Timeline renders correctly with sample openers
- Visual style matches TheBalance aesthetic
- Current action is clearly highlighted
- Completed actions show completion state
- Works at various overlay sizes

---

## Milestone 4: Audio Feedback System

**Objective**: Implement audio cues for opener actions.

### Tasks

1. **Audio Service**

   - Create audio playback service
   - Implement audio preloading for performance
   - Support multiple audio formats (MP3, OGG)
   - Implement volume control

2. **Action Audio Cues**

   - Play audio on successful action detection
   - Support per-action audio customization
   - Implement fallback/default sounds
   - Handle rapid action sequences

3. **Audio Asset Management**
   - Create/source default audio cues
   - Implement audio asset loading system
   - Support user-provided audio files (future)

### Deliverables

- `AudioService` class
- Default audio cue set
- Volume control implementation
- Audio preloading system

### Acceptance Criteria

- Audio plays on action detection
- No audio lag or stutter
- Volume control works
- Audio can be muted/disabled

---

## Milestone 5: Configuration Interface

**Objective**: Build the user configuration UI for selecting openers and adjusting settings.

### Tasks

1. **Configuration Panel Component**

   - Create collapsible/modal config interface
   - Use Mantine components for UI elements
   - Implement toggle to show/hide config

2. **Opener Selection**

   - Job-based opener filtering
   - Opener variant selection (when multiple exist)
   - Zone-specific opener selection
   - Preview of selected opener

3. **Audio Settings**

   - Master volume slider
   - Mute/unmute toggle
   - Per-action audio enable/disable (future)

4. **Visual Settings**

   - Scale/size adjustment
   - Opacity control
   - Position reset

5. **Persistence**
   - Save preferences to localStorage
   - Load preferences on startup
   - Reset to defaults option

### Deliverables

- `ConfigPanel` component
- `OpenerSelector` component
- `AudioSettings` component
- `VisualSettings` component
- localStorage persistence layer

### Acceptance Criteria

- Users can select different openers
- Settings persist across sessions
- Config panel shows/hides properly
- All settings apply immediately

---

## Milestone 6: Zone-Aware Opener Selection

**Objective**: Automatically suggest/switch openers based on current zone/encounter.

### Tasks

1. **Zone Detection Enhancement**

   - Map zone IDs to zone names
   - Identify raid/trial zones
   - Create zone-to-encounter mapping

2. **Encounter-Specific Openers**

   - Support zone/encounter tags on openers
   - Auto-suggest opener on zone change
   - Maintain user override preference

3. **Zone Display**
   - Show current zone in UI (debug/info)
   - Indicate when zone-specific opener is available

### Deliverables

- Zone mapping data
- Zone-aware opener filtering
- Auto-suggestion system
- Zone info display component

### Acceptance Criteria

- Zone changes are detected correctly
- Zone-specific openers are suggested
- User can override auto-selection
- Works for major raid encounters

---

## Milestone 7: Internationalization

**Objective**: Support multiple languages as per project requirements.

### Tasks

1. **i18n Infrastructure**

   - Set up next-intl (or similar for Vite)
   - Create translation file structure
   - Implement language switching

2. **Translation Coverage**

   - English (en) - primary
   - French (fr)
   - German (de)
   - All UI text, tooltips, action names

3. **Language Preference**
   - Detect from ACT/game language
   - Allow manual override
   - Persist preference

### Deliverables

- Translation files (en.json, fr.json, de.json)
- Language switcher component
- Localized UI components

### Acceptance Criteria

- All UI text supports all three languages
- Language can be changed at runtime
- Preference persists across sessions

---

## Milestone 8: Reset & Error Handling

**Objective**: Implement reset functionality and comprehensive error handling.

### Tasks

1. **Reset Functionality**

   - Manual reset button
   - Auto-reset on combat end
   - Auto-reset on zone change (configurable)
   - Reset state to beginning of opener

2. **Error Handling**

   - Missed action detection
   - Out-of-order action detection
   - Visual error indication
   - Recovery options

3. **Logging System**
   - Create logging service
   - Log significant events
   - Log errors with context
   - Debug mode for troubleshooting

### Deliverables

- Reset button component
- Auto-reset logic
- Error state handling
- Logging service

### Acceptance Criteria

- Reset button works correctly
- Auto-reset triggers appropriately
- Errors are clearly indicated
- Logs are useful for troubleshooting

---

## Milestone 9: Performance Optimization

**Objective**: Ensure the overlay is lightweight and performant.

### Tasks

1. **Bundle Optimization**

   - Analyze bundle size
   - Tree-shake unused code
   - Optimize asset loading
   - Minimize dependencies

2. **Runtime Performance**

   - Optimize render cycles
   - Implement React.memo where beneficial
   - Minimize DOM updates
   - Efficient event handling

3. **Asset Optimization**
   - Compress images
   - Optimize audio files
   - Implement lazy loading

### Deliverables

- Bundle size report
- Performance benchmarks
- Optimized build configuration

### Acceptance Criteria

- Bundle size < 500KB (excluding assets)
- No frame drops during gameplay
- Fast initial load time
- Minimal memory footprint

---

## Milestone 10: Production Deployment

**Objective**: Deploy the overlay to Vercel for production use.

### Tasks

1. **Vercel Configuration**

   - Set up Vercel project
   - Configure build settings
   - Set up custom domain (if applicable)

2. **Documentation**

   - User guide for setup
   - Opener creation guide (for contributors)
   - AI prompt template documentation
   - Troubleshooting guide

3. **Testing**
   - End-to-end testing in ACT
   - Cross-browser testing
   - Various resolution testing

### Deliverables

- Production deployment on Vercel
- User documentation
- Contributor documentation
- README updates

### Acceptance Criteria

- Overlay accessible via public URL
- Works correctly when loaded in ACT
- Documentation is complete and accurate
- No critical bugs in production

---

## Future Enhancements (Post-MVP)

These features are beyond the initial scope but could be added later:

1. **Extended Job Support**

   - Complete opener library for all jobs
   - Community-contributed openers

2. **Advanced Audio**

   - Text-to-speech action callouts
   - Custom audio file upload

3. **Analytics**

   - Opener success rate tracking
   - Performance metrics

4. **Visual Themes**

   - Multiple visual themes
   - Custom theming support

5. **Sync Features**
   - Cloud sync for preferences
   - Opener sharing

---

## Development Timeline Estimate

| Milestone                         | Estimated Duration |
| --------------------------------- | ------------------ |
| M1: Foundation & ACT Integration  | 2-3 days           |
| M2: Data Model & Action Detection | 2-3 days           |
| M3: Visual Timeline               | 3-4 days           |
| M4: Audio System                  | 1-2 days           |
| M5: Configuration UI              | 2-3 days           |
| M6: Zone-Aware Selection          | 1-2 days           |
| M7: Internationalization          | 2-3 days           |
| M8: Reset & Error Handling        | 1-2 days           |
| M9: Performance Optimization      | 1-2 days           |
| M10: Production Deployment        | 1-2 days           |

**Total Estimated Duration**: 16-26 days

---

## File Structure Preview

```
src/
├── app/                      # Main app entry
├── components/               # UI Components
│   ├── ui/                   # Base Mantine components
│   ├── timeline/             # Opener timeline components
│   │   ├── OpenerTimeline.tsx
│   │   ├── ActionIcon.tsx
│   │   └── GCDSlot.tsx
│   └── config/               # Configuration components
│       ├── ConfigPanel.tsx
│       ├── OpenerSelector.tsx
│       └── AudioSettings.tsx
├── features/                 # Feature modules
│   ├── act/                  # ACT integration
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── opener/               # Opener logic
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── audio/                # Audio system
│       ├── services/
│       └── hooks/
├── data/                     # Static data
│   ├── openers/              # Opener JSON files
│   └── zones/                # Zone mappings
├── stores/                   # Zustand stores
├── lib/                      # Utilities
│   ├── storage/              # localStorage utilities
│   └── logging/              # Logging service
├── messages/                 # i18n translations
│   ├── en.json
│   ├── fr.json
│   └── de.json
└── types/                    # Shared TypeScript types
```

---

## Notes

- This project prioritizes lightweight performance over feature richness
- Visual design should closely match TheBalance's opener images
- Audio feedback is a key differentiator for this overlay
- The AI prompt template for opener creation is an important documentation deliverable
- All development should follow the instruction files in `.github/instructions/`
