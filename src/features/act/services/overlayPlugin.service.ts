import type { OverlayEvent, OverlayEventCallback } from '@/types/overlay.types';

/**
 * Service to interact with ACT's OverlayPlugin API.
 * Provides typed wrappers around the global OverlayPlugin functions.
 */
class OverlayPluginService {
  private isAvailable = false;
  private listeners = new Map<string, Set<OverlayEventCallback<OverlayEvent>>>();

  constructor() {
    this.checkAvailability();
  }

  private checkAvailability(): void {
    this.isAvailable =
      typeof window !== 'undefined' &&
      typeof window.addOverlayListener === 'function' &&
      typeof window.startOverlayEvents === 'function';

    if (!this.isAvailable) {
      console.warn('OverlayPlugin API not available - running in standalone mode');
    }
  }

  /**
   * Check if OverlayPlugin API is available (i.e., loaded in ACT)
   */
  public isPluginAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Register an event listener for a specific OverlayPlugin event
   */
  public addEventListener<T extends OverlayEvent>(
    eventType: T['type'],
    callback: OverlayEventCallback<T>
  ): void {
    if (!this.isAvailable) {
      console.warn(`Cannot add listener for ${eventType} - OverlayPlugin not available`);
      return;
    }

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)?.add(callback as OverlayEventCallback<OverlayEvent>);

    window.addOverlayListener?.(eventType, callback);
    console.log(`[OverlayPlugin] Registered listener for ${eventType}`);
  }

  /**
   * Remove an event listener
   */
  public removeEventListener<T extends OverlayEvent>(
    eventType: T['type'],
    callback: OverlayEventCallback<T>
  ): void {
    if (!this.isAvailable) return;

    this.listeners.get(eventType)?.delete(callback as OverlayEventCallback<OverlayEvent>);
    window.removeOverlayListener?.(eventType, callback);
    console.log(`[OverlayPlugin] Removed listener for ${eventType}`);
  }

  /**
   * Call an OverlayPlugin handler (e.g., getCombatants, getLanguage)
   */
  public async callHandler<T = unknown>(params: {
    call: string;
    [key: string]: unknown;
  }): Promise<T | null> {
    if (!this.isAvailable || !window.callOverlayHandler) {
      console.warn(`Cannot call handler ${params.call} - OverlayPlugin not available`);
      return null;
    }

    try {
      return await window.callOverlayHandler<T>(params);
    } catch (error) {
      console.error(`[OverlayPlugin] Handler call failed:`, error);
      return null;
    }
  }

  /**
   * Start receiving OverlayPlugin events.
   * MUST be called after all listeners are registered.
   */
  public startEvents(): void {
    if (!this.isAvailable || !window.startOverlayEvents) {
      console.warn('Cannot start events - OverlayPlugin not available');
      return;
    }

    window.startOverlayEvents();
    console.log('[OverlayPlugin] Events started');
  }

  /**
   * Remove all event listeners
   */
  public cleanup(): void {
    for (const [eventType, callbacks] of this.listeners.entries()) {
      for (const callback of callbacks) {
        window.removeOverlayListener?.(eventType as OverlayEvent['type'], callback);
      }
    }
    this.listeners.clear();
    console.log('[OverlayPlugin] Cleanup complete');
  }
}

export const overlayPluginService = new OverlayPluginService();
