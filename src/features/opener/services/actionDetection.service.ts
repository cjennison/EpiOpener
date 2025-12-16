/**
 * Action Detection Service
 *
 * Parses FFXIV log lines to detect ability usage.
 * Log line format documentation:
 * https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md
 */

export interface DetectedAction {
  /** Timestamp of the action */
  timestamp: string;

  /** Source actor ID */
  sourceId: string;

  /** Source actor name */
  sourceName: string;

  /** Ability ID (hex string) */
  abilityId: string;

  /** Ability name */
  abilityName: string;

  /** Target actor ID */
  targetId?: string;

  /** Target actor name */
  targetName?: string;
}

/**
 * Log line types we care about:
 * - Type 21 (0x15): NetworkAbility - Player abilities
 * - Type 22 (0x16): NetworkAOEAbility - AOE abilities
 */
const ACTION_LOG_TYPES = ['21', '22'];

class ActionDetectionService {
  /**
   * Parse a log line and extract action information if it's an ability usage
   */
  public parseLogLine(line: string[]): DetectedAction | null {
    if (line.length < 6) return null;

    const logType = line[0];

    if (!logType || !ACTION_LOG_TYPES.includes(logType)) {
      return null;
    }

    // Log line format for type 21/22:
    // [0] = log type
    // [1] = timestamp
    // [2] = source actor ID
    // [3] = source actor name
    // [4] = ability ID
    // [5] = ability name
    // [6] = target actor ID (if applicable)
    // [7] = target actor name (if applicable)

    return {
      timestamp: line[1] || '',
      sourceId: line[2] || '',
      sourceName: line[3] || '',
      abilityId: this.normalizeAbilityId(line[4] || ''),
      abilityName: line[5] || '',
      targetId: line[6],
      targetName: line[7],
    };
  }

  /**
   * Normalize ability ID to uppercase hex without "0x" prefix
   */
  private normalizeAbilityId(id: string): string {
    return id.replace(/^0x/i, '').toUpperCase().padStart(4, '0');
  }

  /**
   * Check if an action matches a specific ability ID
   */
  public matchesAbilityId(action: DetectedAction, expectedId: string): boolean {
    const normalizedExpected = this.normalizeAbilityId(expectedId);
    return action.abilityId === normalizedExpected;
  }

  /**
   * Check if an action matches by name (case-insensitive)
   */
  public matchesAbilityName(action: DetectedAction, expectedName: string): boolean {
    return action.abilityName.toLowerCase() === expectedName.toLowerCase();
  }

  /**
   * Filter actions by source (e.g., only player actions)
   */
  public isFromSource(action: DetectedAction, sourceId: string, sourceName?: string): boolean {
    if (sourceId && action.sourceId !== sourceId) {
      return false;
    }

    if (sourceName && action.sourceName !== sourceName) {
      return false;
    }

    return true;
  }
}

export const actionDetectionService = new ActionDetectionService();
