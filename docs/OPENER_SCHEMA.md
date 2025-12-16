# Opener JSON Schema Documentation

This document describes the JSON schema for defining FFXIV openers in EpiOpener.

## Schema Overview

Each opener is defined as a JSON file with the following structure:

```typescript
{
  "id": string,              // Unique identifier (e.g., "war-standard-dt-71")
  "job": string,             // Job abbreviation (e.g., "WAR", "BLM")
  "name": string,            // Human-readable name
  "version": string,         // Game version (e.g., "7.1")
  "audioEnabled": boolean,   // Default audio state
  "notes": string,           // Optional description
  "source": string,          // Optional URL to guide
  "zoneId": number,          // Optional: specific zone/encounter
  "encounterName": string,   // Optional: encounter display name
  "actions": OpenerAction[]  // Ordered list of actions
}
```

## Action Schema

Each action in the `actions` array has:

```typescript
{
  "id": string,           // Unique identifier within opener
  "name": string,         // Display name (e.g., "Tomahawk")
  "type": ActionType,     // "gcd" | "ogcd" | "potion" | "sprint"
  "position": number,     // GCD position (1-indexed)
  "weaveSlot": number,    // For oGCDs: 1 or 2 (which weave window)
  "actionId": string,     // FFXIV action ID (hex, e.g., "0002E6")
  "iconId": string,       // Icon ID for display (e.g., "000261")
  "audioFile": string,    // Optional: custom audio file
  "delayMs": number       // Optional: delay before action (for pre-pull)
}
```

## Field Details

### Action Types

- **`gcd`**: GCD abilities (Heavy Swing, Fire IV, etc.)
- **`ogcd`**: Off-GCD abilities (Infuriate, Triplecast, etc.)
- **`potion`**: Tincture/potion usage
- **`sprint`**: Sprint (rarely used in openers)

### Position & Weave Slots

- `position`: Which GCD this action belongs to (1 = first GCD, 2 = second GCD, etc.)
- `weaveSlot`: For oGCDs only, which weave window (1 = first weave, 2 = second weave)

Example:

```json
{
  "position": 2,
  "weaveSlot": 1
}
```

This means: First oGCD weaved after the 2nd GCD.

### Action IDs

FFXIV uses hex action IDs. You can find these in:

- ACT log lines (type 21/22)
- XIVApi: https://xivapi.com/
- Cactbot: https://github.com/quisquous/cactbot/tree/main/resources

Format: Hex string without "0x" prefix (e.g., `"0002E6"` for Tomahawk)

### Icon IDs

Icon IDs are used to display ability icons. These are 6-digit strings:

- Find them in XIVApi or game data
- Format: 6-digit string (e.g., `"000261"`)

### Pre-pull Timing

Use `delayMs` for pre-pull actions:

- Negative values = before pull (e.g., `-3000` = 3 seconds before pull)
- Positive values = delay after expected time

## Example: WAR Opener

```json
{
  "id": "war-standard-dt-71",
  "job": "WAR",
  "name": "Standard Dawntrail 7.1 Opener",
  "version": "7.1",
  "audioEnabled": true,
  "actions": [
    {
      "id": "tomahawk",
      "name": "Tomahawk",
      "type": "gcd",
      "position": 1,
      "actionId": "0002E6",
      "iconId": "000261",
      "delayMs": -3000
    },
    {
      "id": "infuriate-1",
      "name": "Infuriate",
      "type": "ogcd",
      "position": 1,
      "weaveSlot": 1,
      "actionId": "0009FB",
      "iconId": "002555"
    },
    {
      "id": "heavy-swing",
      "name": "Heavy Swing",
      "type": "gcd",
      "position": 2,
      "actionId": "0001F5",
      "iconId": "000260"
    }
  ]
}
```

## Creating Openers with AI

You can use AI to generate opener JSON from TheBalance images. Use this prompt template:

---

### AI Prompt Template

```
I need you to convert this FFXIV opener image into JSON format following this schema:

[Paste the schema above]

The image shows an opener for [JOB NAME] in patch [VERSION].

Please:
1. Extract all actions from left to right
2. Identify which actions are GCDs and which are oGCDs
3. Assign position numbers for each GCD (1, 2, 3, etc.)
4. For oGCDs, determine the weaveSlot (1 or 2) based on vertical alignment
5. Use action IDs from XIVApi or Cactbot if possible, otherwise use placeholder "0000XX"
6. Use icon IDs if available, otherwise use "XXXXXX"

Output the complete JSON file ready to save as [job]-[variant]-[version].json
```

---

## File Naming Convention

Save opener files as: `{job}-{variant}-{version}.json`

Examples:

- `war-standard-dt-71.json` - Standard WAR opener for Dawntrail 7.1
- `blm-triple-transpose-dt-71.json` - BLM triple transpose variant
- `war-m1s-dt-71.json` - WAR opener specific to M1S encounter

## Adding New Openers

1. Create JSON file in `src/data/openers/`
2. Import it in `src/features/opener/services/opener.service.ts`
3. Add to the `allOpeners` array in `loadOpeners()` method
4. Restart dev server

## Validation

The TypeScript interfaces provide compile-time validation. Runtime validation can be added using Zod if needed (future enhancement).

## Resources

- **XIVApi**: https://xivapi.com/ - Action and icon data
- **Cactbot**: https://github.com/quisquous/cactbot - Action IDs and log parsing
- **The Balance**: https://www.thebalanceffxiv.com/ - Opener guides and images
- **ACT LogGuide**: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md
