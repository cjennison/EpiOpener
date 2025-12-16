import { create } from 'zustand';
import type { Opener, OpenerProgress } from '@/types/opener.types';

interface OverlayState {
  // Player state
  playerName: string | null;
  playerCharId: string | null;
  playerJob: string | null;

  // Zone state
  currentZone: string | null;
  currentZoneId: number | null;

  // Combat state
  inCombat: boolean;
  encounterTitle: string | null;

  // Opener state
  currentOpener: Opener | null;
  openerProgress: OpenerProgress | null;

  // Actions
  setPlayer: (charId: string, charName: string) => void;
  setPlayerJob: (job: string) => void;
  setZone: (zoneId: number, zoneName?: string) => void;
  setCombatState: (active: boolean, encounterTitle?: string) => void;
  setCurrentOpener: (opener: Opener | null) => void;
  setOpenerProgress: (progress: OpenerProgress | null) => void;
  logAction: (actionName: string, actionId: string) => void;
  reset: () => void;
}

const initialState = {
  playerName: null,
  playerCharId: null,
  playerJob: null,
  currentZone: null,
  currentZoneId: null,
  inCombat: false,
  encounterTitle: null,
  currentOpener: null,
  openerProgress: null,
};

export const useOverlayStore = create<OverlayState>((set) => ({
  ...initialState,

  setPlayer: (charId, charName) => {
    console.log(`[Store] Player changed: ${charName} (${charId})`);
    set({ playerCharId: charId, playerName: charName });
  },

  setPlayerJob: (job) => {
    console.log(`[Store] Job changed: ${job}`);
    set({ playerJob: job });
  },

  setZone: (zoneId, zoneName) => {
    console.log(`[Store] Zone changed: ${zoneName || 'Unknown'} (${zoneId})`);
    set({ currentZoneId: zoneId, currentZone: zoneName || `Zone ${zoneId}` });
  },
  setCombatState: (active, encounterTitle) => {
    console.log(`[Store] Combat ${active ? 'started' : 'ended'}`, encounterTitle || '');
    set({ inCombat: active, encounterTitle: encounterTitle || null });
  },

  setCurrentOpener: (opener) => {
    console.log(`[Store] Opener changed:`, opener?.name || 'None');
    set({ currentOpener: opener });
  },

  setOpenerProgress: (progress) => {
    set({ openerProgress: progress });
  },

  logAction: (actionName, actionId) => {
    console.log(`[Store] Action detected: ${actionName} (${actionId})`);
  },

  reset: () => {
    console.log('[Store] Resetting state');
    set(initialState);
  },
}));
