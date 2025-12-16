import { useEffect } from 'react';
import { overlayPluginService } from '../services/overlayPlugin.service';
import { useOverlayStore } from '@/stores/overlayStore';
import type {
  ChangePrimaryPlayerEvent,
  ChangeZoneEvent,
  LogLineEvent,
  CombatDataEvent,
} from '@/types/overlay.types';

/**
 * Component that registers OverlayPlugin event listeners and updates the store.
 * This component doesn't render anything - it only manages event subscriptions.
 */
export function OverlayListener() {
  const { setPlayer, setZone, setCombatState, logAction } = useOverlayStore();

  useEffect(() => {
    console.log('[OverlayListener] Initializing ACT event listeners...');

    // Listen for player changes (job switches)
    const handlePlayerChange = (data: ChangePrimaryPlayerEvent) => {
      console.log('[ACT Event] ChangePrimaryPlayer:', data);
      setPlayer(data.charID, data.charName);
    };

    // Listen for zone changes
    const handleZoneChange = (data: ChangeZoneEvent) => {
      console.log('[ACT Event] ChangeZone:', data);
      setZone(data.zoneID, data.zoneName);
    };

    // Listen for combat data updates
    const handleCombatData = (data: CombatDataEvent) => {
      const isActive = data.isActive === 'true';
      const encounterTitle = data.Encounter?.title;

      if (isActive !== useOverlayStore.getState().inCombat) {
        console.log('[ACT Event] CombatData:', { isActive, encounterTitle });
        setCombatState(isActive, encounterTitle);
      }
    };

    // Listen for log lines (action usage)
    const handleLogLine = (data: LogLineEvent) => {
      // LogLine format: [timestamp, logType, ...data]
      // We'll parse this more thoroughly in MS2
      // For now, just log interesting lines
      const logType = data.line[0];

      // Type 21 and 22 are typically ability usage lines
      if (logType === '21' || logType === '22') {
        console.log('[ACT Event] LogLine (Action):', data.line);

        // Basic parsing: [timestamp, type, sourceId, sourceName, abilityId, abilityName, ...]
        const abilityId = data.line[4] || 'unknown';
        const abilityName = data.line[5] || 'unknown';
        logAction(abilityName, abilityId);
      }
    };

    // Register all listeners
    overlayPluginService.addEventListener('ChangePrimaryPlayer', handlePlayerChange);
    overlayPluginService.addEventListener('ChangeZone', handleZoneChange);
    overlayPluginService.addEventListener('CombatData', handleCombatData);
    overlayPluginService.addEventListener('LogLine', handleLogLine);

    // Start receiving events
    overlayPluginService.startEvents();

    // Cleanup on unmount
    return () => {
      console.log('[OverlayListener] Cleaning up event listeners...');
      overlayPluginService.removeEventListener('ChangePrimaryPlayer', handlePlayerChange);
      overlayPluginService.removeEventListener('ChangeZone', handleZoneChange);
      overlayPluginService.removeEventListener('CombatData', handleCombatData);
      overlayPluginService.removeEventListener('LogLine', handleLogLine);
    };
  }, [setPlayer, setZone, setCombatState, logAction]);

  return null;
}
