/**
 * Opener Service
 *
 * Manages loading, validating, and matching openers to the current job.
 * Tracks opener progression as actions are detected.
 */

import type { Opener, OpenerProgress } from '@/types/opener.types';

// Import opener JSON files
import warStandardDt71 from '@/data/openers/war-standard-dt-71.json';
import blmStandardDt71 from '@/data/openers/blm-standard-dt-71.json';

class OpenerService {
  private openers: Map<string, Opener[]> = new Map();

  constructor() {
    this.loadOpeners();
  }

  /**
   * Load all available openers and organize by job
   */
  private loadOpeners(): void {
    const allOpeners: Opener[] = [warStandardDt71 as Opener, blmStandardDt71 as Opener];

    // Group openers by job
    for (const opener of allOpeners) {
      const existing = this.openers.get(opener.job) || [];
      existing.push(opener);
      this.openers.set(opener.job, existing);
    }

    console.log('[OpenerService] Loaded openers:', {
      total: allOpeners.length,
      jobs: Array.from(this.openers.keys()),
    });
  }

  /**
   * Get all openers for a specific job
   */
  public getOpenersForJob(job: string): Opener[] {
    return this.openers.get(job.toUpperCase()) || [];
  }

  /**
   * Get a specific opener by ID
   */
  public getOpenerById(openerId: string): Opener | null {
    for (const openerList of this.openers.values()) {
      const opener = openerList.find((o) => o.id === openerId);
      if (opener) return opener;
    }
    return null;
  }

  /**
   * Get the default opener for a job (first one in the list)
   */
  public getDefaultOpenerForJob(job: string): Opener | null {
    const openers = this.getOpenersForJob(job);
    return openers[0] || null;
  }

  /**
   * Get openers for a specific zone/encounter
   */
  public getOpenersForZone(job: string, zoneId: number): Opener[] {
    const jobOpeners = this.getOpenersForJob(job);
    return jobOpeners.filter((opener) => opener.zoneId === zoneId);
  }

  /**
   * Create initial progress state for an opener
   */
  public createProgress(_opener: Opener): OpenerProgress {
    return {
      currentIndex: 0,
      completedActions: [],
      missedActions: [],
      isComplete: false,
      startTime: null,
    };
  }

  /**
   * Check if an action ID matches the expected action in the opener
   */
  public matchesExpectedAction(
    opener: Opener,
    progress: OpenerProgress,
    abilityId: string
  ): boolean {
    const currentAction = opener.actions[progress.currentIndex];
    if (!currentAction) return false;

    const normalizedDetected = this.normalizeAbilityId(abilityId);
    const normalizedExpected = this.normalizeAbilityId(currentAction.actionId);

    return normalizedDetected === normalizedExpected;
  }

  /**
   * Advance the opener progress when correct action is detected
   */
  public advanceProgress(opener: Opener, progress: OpenerProgress): OpenerProgress {
    const currentAction = opener.actions[progress.currentIndex];
    if (!currentAction) return progress;

    const newProgress: OpenerProgress = {
      ...progress,
      currentIndex: progress.currentIndex + 1,
      completedActions: [...progress.completedActions, currentAction.id],
      startTime: progress.startTime || Date.now(),
    };

    // Check if opener is complete
    if (newProgress.currentIndex >= opener.actions.length) {
      newProgress.isComplete = true;
    }

    return newProgress;
  }

  /**
   * Mark an action as missed
   */
  public markActionMissed(opener: Opener, progress: OpenerProgress): OpenerProgress {
    const currentAction = opener.actions[progress.currentIndex];
    if (!currentAction) return progress;

    return {
      ...progress,
      missedActions: [...progress.missedActions, currentAction.id],
    };
  }

  /**
   * Normalize ability ID format
   */
  private normalizeAbilityId(id: string): string {
    return id.replace(/^0x/i, '').toUpperCase().padStart(4, '0');
  }

  /**
   * Get all available jobs
   */
  public getAvailableJobs(): string[] {
    return Array.from(this.openers.keys()).sort();
  }
}

export const openerService = new OpenerService();
