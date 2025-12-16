import { useEffect } from 'react';
import { overlayPluginService } from '../services/overlayPlugin.service';
import { useOverlayStore } from '@/stores/overlayStore';
import { getJobName } from '@/lib/jobs';
import type {
  ChangePrimaryPlayerEvent,
  ChangeZoneEvent,
  LogLineEvent,
  CombatDataEvent,
  PartyChangedEvent,
  GetCombatantsResponse,
} from '@/types/overlay.types';

/**
 * Component that registers OverlayPlugin event listeners and updates the store.
 * This component doesn't render anything - it only manages event subscriptions.
 */
export function OverlayListener() {
  const { setPlayer, setPlayerJob, setZone, setCombatState, logAction } = useOverlayStore();

  useEffect(() => {
    console.log('[OverlayListener] Initializing ACT event listeners...');

    // Fetch current player's combatant data to get job info
    const fetchPlayerJob = async () => {
      const result = await overlayPluginService.callHandler<GetCombatantsResponse>({
        call: 'getCombatants',
      });

      if (result?.combatants && result.combatants.length > 0) {
        // First combatant is usually the player
        const player = result.combatants[0];
        if (player) {
          const jobName = getJobName(player.Job);
          console.log('[OverlayListener] Player job detected:', jobName, `(${player.Job})`);
          setPlayerJob(jobName);
        }
      }
    };

    // Listen for player changes (job switches)
    const handlePlayerChange = (data: ChangePrimaryPlayerEvent) => {
      console.log('[ACT Event] ChangePrimaryPlayer:', data);
      setPlayer(data.charID, data.charName);
      // Fetch job info after player change
      fetchPlayerJob();
    };

    // Listen for party changes (includes job info)
    const handlePartyChange = (data: PartyChangedEvent) => {
      console.log('[ACT Event] PartyChanged:', data);
      // Find the current player in the party list
      const currentPlayerName = useOverlayStore.getState().playerName;
      if (currentPlayerName) {
        const playerInParty = data.party.find((member) => member.name === currentPlayerName);
        if (playerInParty) {
          const jobName = getJobName(playerInParty.job);
          console.log('[ACT Event] Player job from party:', jobName);
          setPlayerJob(jobName);
        }
      }
    };

    // Listen for zone changes
    const handleZoneChange = (data: ChangeZoneEvent) => {
      console.log('[ACT Event] ChangeZone:', data);
      setZone(data.zoneID, data.zoneName);
      // Re-fetch job info on zone change
      fetchPlayerJob();
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
    overlayPluginService.addEventListener('PartyChanged', handlePartyChange);
    overlayPluginService.addEventListener('ChangeZone', handleZoneChange);
    overlayPluginService.addEventListener('CombatData', handleCombatData);
    overlayPluginService.addEventListener('LogLine', handleLogLine);

    // Start receiving events
    overlayPluginService.startEvents();

    // Fetch initial job info
    fetchPlayerJob();

    // Cleanup on unmount
    return () => {
      console.log('[OverlayListener] Cleaning up event listeners...');
      overlayPluginService.removeEventListener('ChangePrimaryPlayer', handlePlayerChange);
      overlayPluginService.removeEventListener('PartyChanged', handlePartyChange);
      overlayPluginService.removeEventListener('ChangeZone', handleZoneChange);
      overlayPluginService.removeEventListener('CombatData', handleCombatData);
      overlayPluginService.removeEventListener('LogLine', handleLogLine);
    };
  }, [setPlayer, setPlayerJob, setZone, setCombatState, logAction]);

  return null;
}
