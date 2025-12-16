/**
 * TypeScript definitions for OverlayPlugin API events and handlers.
 * Docs: https://ngld.github.io/OverlayPlugin/devs/event_types
 */

export interface ChangePrimaryPlayerEvent {
  type: 'ChangePrimaryPlayer';
  charID: string;
  charName: string;
}

export interface ChangeZoneEvent {
  type: 'ChangeZone';
  zoneID: number;
  zoneName?: string;
}

export interface LogLineEvent {
  type: 'LogLine';
  line: string[];
  rawLine: string;
}

export interface CombatDataEvent {
  type: 'CombatData';
  isActive: 'true' | 'false';
  Encounter?: {
    title: string;
    duration: string;
    ENCDPS: string;
    damage: string;
  };
}

export interface PartyChangedEvent {
  type: 'PartyChanged';
  party: Array<{
    id: string;
    name: string;
    worldId: number;
    job: number;
    inParty: boolean;
  }>;
}

export interface OnlineStatusChangedEvent {
  type: 'OnlineStatusChanged';
  target: string;
  rawStatus: number;
  status: string;
}

export interface Combatant {
  ID: number;
  Name: string;
  Job: number;
  Level: number;
  CurrentHP: number;
  MaxHP: number;
  CurrentMP: number;
  MaxMP: number;
  PosX: number;
  PosY: number;
  PosZ: number;
}

export interface GetCombatantsResponse {
  combatants: Combatant[];
}

export type OverlayEvent =
  | ChangePrimaryPlayerEvent
  | ChangeZoneEvent
  | LogLineEvent
  | CombatDataEvent
  | PartyChangedEvent
  | OnlineStatusChangedEvent;

export type OverlayEventType = OverlayEvent['type'];

export type OverlayEventCallback<T extends OverlayEvent> = (data: T) => void;

/**
 * OverlayPlugin global API (available when common.min.js is loaded)
 */
declare global {
  interface Window {
    addOverlayListener?: <T extends OverlayEvent>(
      event: T['type'],
      callback: OverlayEventCallback<T>
    ) => void;
    removeOverlayListener?: <T extends OverlayEvent>(
      event: T['type'],
      callback: OverlayEventCallback<T>
    ) => void;
    callOverlayHandler?: <T = unknown>(params: {
      call: string;
      [key: string]: unknown;
    }) => Promise<T>;
    startOverlayEvents?: () => void;
  }
}
