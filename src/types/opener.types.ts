/**
 * Opener Data Model
 *
 * This defines the structure for FFXIV opener sequences.
 * Each opener is a JSON file that describes the sequence of actions
 * for a specific job, with timing information and visual/audio assets.
 */

export type ActionType = 'gcd' | 'ogcd' | 'potion' | 'sprint';

export interface OpenerAction {
  /** Unique identifier for this action in the opener */
  id: string;

  /** Display name of the action */
  name: string;

  /** Action type determines timing and positioning */
  type: ActionType;

  /** GCD position (1-indexed, e.g., 1 = first GCD, 2 = second GCD) */
  position: number;

  /** For oGCDs: which weave slot after the GCD (1 = first weave, 2 = second weave) */
  weaveSlot?: number;

  /** FFXIV action ID (hex string, e.g., "0000261" for Tomahawk) */
  actionId: string;

  /** Icon ID for visual display (e.g., "000261") */
  iconId: string;

  /** Custom audio cue file (optional, falls back to default) */
  audioFile?: string;

  /** Delay in milliseconds before this action (for pre-pull timing) */
  delayMs?: number;
}

export interface Opener {
  /** Unique identifier for this opener */
  id: string;

  /** Job abbreviation (e.g., "WAR", "BLM", "DRG") */
  job: string;

  /** Human-readable name for this opener */
  name: string;

  /** Game version this opener is for (e.g., "7.0", "7.1") */
  version: string;

  /** Optional: specific zone/encounter this opener is for */
  zoneId?: number;

  /** Optional: encounter name for display */
  encounterName?: string;

  /** Ordered list of actions in the opener sequence */
  actions: OpenerAction[];

  /** Whether audio cues are enabled by default */
  audioEnabled: boolean;

  /** Optional: notes or description about this opener */
  notes?: string;

  /** Optional: source URL (e.g., TheBalance guide) */
  source?: string;
}

export interface OpenerProgress {
  /** Which action index we're currently on (0-indexed) */
  currentIndex: number;

  /** Actions that have been completed */
  completedActions: string[];

  /** Actions that were missed or done out of order */
  missedActions: string[];

  /** Whether the opener sequence is complete */
  isComplete: boolean;

  /** Timestamp when opener started */
  startTime: number | null;
}

export interface OpenerLibrary {
  /** Map of job abbreviation to list of available openers */
  [job: string]: Opener[];
}
