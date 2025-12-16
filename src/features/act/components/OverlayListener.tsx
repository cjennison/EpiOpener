import { useEffect } from 'react';
import { overlayPluginService } from '../services/overlayPlugin.service';
import { useOverlayStore } from '@/stores/overlayStore';
import { getJobName } from '@/lib/jobs';
import { actionDetectionService } from '@/features/opener/services/actionDetection.service';
import { openerService } from '@/features/opener/services/opener.service';
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
  const {
    setPlayer,
    setPlayerJob,
    setZone,
    setCombatState,
    setCurrentOpener,
    setOpenerProgress,
    logAction,
  } = useOverlayStore();

  useEffect(() => {
    console.log('[OverlayListener] Initializing ACT event listeners...');

    // Function to fetch player job info from getCombatants
    const fetchPlayerJob = async () => {
      const result = await overlayPluginService.callHandler<GetCombatantsResponse>({
        call: 'getCombatants',
      });
      if (result && result.combatants && result.combatants.length > 0) {
        const player = result.combatants[0];
        if (player) {
          const jobName = getJobName(player.Job);
          console.log('[OverlayListener] Player job detected:', jobName, `(${player.Job})`);
          setPlayerJob(jobName);

          // Load default opener for this job
          const opener = openerService.getDefaultOpenerForJob(jobName);
          if (opener) {
            console.log('[OverlayListener] Loaded opener:', opener.name);
            setCurrentOpener(opener);
            setOpenerProgress(openerService.createProgress(opener));
          }
        }
      }
    };

    // Listen for player changes (job switches)
    const handlePlayerChange = (data: ChangePrimaryPlayerEvent) => {
      console.log('[ACT Event] ChangePrimaryPlayer:', data);
      setPlayer(data.charID, data.charName);
      void fetchPlayerJob();
    };

    // Listen for party changes (includes job info)
    const handlePartyChange = (data: PartyChangedEvent) => {
      console.log('[ACT Event] PartyChanged:', data);
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
      void fetchPlayerJob();
    };

    // Listen for combat data updates
    const handleCombatData = (data: CombatDataEvent) => {
      const isActive = data.isActive === 'true';
      setCombatState(isActive, data.Encounter?.title);
    };

    // Listen for log lines (action usage)
    const handleLogLine = (data: LogLineEvent) => {
      const action = actionDetectionService.parseLogLine(data.line);

      if (!action) return;

      // Filter to only player actions
      const playerName = useOverlayStore.getState().playerName;
      if (!playerName || action.sourceName !== playerName) {
        return;
      }

      console.log('[ACT Event] Player Action:', action.abilityName, `(${action.abilityId})`);
      logAction(action.abilityName, action.abilityId);

      // Check if this matches the current opener progression
      const state = useOverlayStore.getState();
      const { currentOpener, openerProgress } = state;

      if (currentOpener && openerProgress && !openerProgress.isComplete) {
        const matches = openerService.matchesExpectedAction(
          currentOpener,
          openerProgress,
          action.abilityId
        );

        if (matches) {
          console.log(
            '[Opener] ✓ Correct action:',
            action.abilityName,
            `(${openerProgress.currentIndex + 1}/${currentOpener.actions.length})`
          );
          const newProgress = openerService.advanceProgress(currentOpener, openerProgress);
          setOpenerProgress(newProgress);

          if (newProgress.isComplete) {
            console.log('[Opener] Opener complete!');
          }
        } else {
          const expectedAction = currentOpener.actions[openerProgress.currentIndex];
          if (expectedAction) {
            console.warn(
              '[Opener] Wrong action! Expected:',
              expectedAction.name,
              `(${expectedAction.actionId}), Got:`,
              action.abilityName,
              `(${action.abilityId})`
            );
          }
        }
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
    void fetchPlayerJob();

    // Cleanup on unmount
    return () => {
      console.log('[OverlayListener] Cleaning up event listeners...');
      overlayPluginService.removeEventListener('ChangePrimaryPlayer', handlePlayerChange);
      overlayPluginService.removeEventListener('PartyChanged', handlePartyChange);
      overlayPluginService.removeEventListener('ChangeZone', handleZoneChange);
      overlayPluginService.removeEventListener('CombatData', handleCombatData);
      overlayPluginService.removeEventListener('LogLine', handleLogLine);
    };
  }, [
    setPlayer,
    setPlayerJob,
    setZone,
    setCombatState,
    setCurrentOpener,
    setOpenerProgress,
    logAction,
  ]);

  return null;
}
