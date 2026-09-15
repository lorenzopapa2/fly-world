/** Browser-local colony persistence. Not a server and not MaleCNS biology. */

import {
  CATCH_UP_MAX_S,
  CATCH_UP_STEP_S,
  MAX_ADULTS,
  MAX_EGGS,
  advanceGardenLife,
  emptyColony,
  type GardenCritter,
  type GardenLife,
} from './gardenLife.ts';

export const COLONY_STORAGE_KEY = 'fly-world.garden-colony.v1';

export type ColonySave = {
  version: 1;
  colonyTime: number;
  lastSimTimestamp: number;
  paused: boolean;
  nextId: number;
  lastClutchAt: number;
  critters: GardenCritter[];
};

export type ColonyRuntime = {
  life: GardenLife;
  paused: boolean;
  lastSimTimestamp: number;
  wallMs: number;
};

const stages = new Set(['egg', 'young', 'adult']);

function isCritter(value: unknown): value is GardenCritter {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return Number.isSafeInteger(row.id)
    && stages.has(String(row.stage))
    && typeof row.bornAt === 'number' && Number.isFinite(row.bornAt)
    && typeof row.nestX === 'number' && Number.isFinite(row.nestX)
    && typeof row.nestY === 'number' && Number.isFinite(row.nestY);
}

export function parseColonySave(input: unknown): ColonySave | null {
  if (typeof input !== 'object' || input === null) return null;
  const row = input as Record<string, unknown>;
  if (row.version !== 1) return null;
  if (typeof row.colonyTime !== 'number' || !Number.isFinite(row.colonyTime) || row.colonyTime < 0) return null;
  if (typeof row.lastSimTimestamp !== 'number' || !Number.isFinite(row.lastSimTimestamp)) return null;
  if (typeof row.paused !== 'boolean') return null;
  if (!Number.isSafeInteger(row.nextId) || (row.nextId as number) < 2) return null;
  if (typeof row.lastClutchAt !== 'number' || !Number.isFinite(row.lastClutchAt)) return null;
  if (!Array.isArray(row.critters) || !row.critters.every(isCritter)) return null;
  const critters = (row.critters as GardenCritter[]).map(item => ({ ...item }));
  const adults = critters.filter(item => item.stage === 'adult').length;
  const eggs = critters.filter(item => item.stage === 'egg').length;
  if (adults > MAX_ADULTS || eggs > MAX_EGGS || critters.length > MAX_ADULTS + MAX_EGGS + 8) return null;
  if (critters.length < 2) return null;
  return {
    version: 1,
    colonyTime: row.colonyTime,
    lastSimTimestamp: row.lastSimTimestamp,
    paused: row.paused,
    nextId: row.nextId as number,
    lastClutchAt: row.lastClutchAt,
    critters,
  };
}

export function toColonySave(runtime: Omit<ColonyRuntime, 'wallMs'>): ColonySave {
  return {
    version: 1,
    colonyTime: runtime.life.colonyTime,
    lastSimTimestamp: runtime.lastSimTimestamp,
    paused: runtime.paused,
    nextId: runtime.life.nextId,
    lastClutchAt: runtime.life.lastClutchAt,
    critters: runtime.life.critters.map(item => ({ ...item })),
  };
}

export function lifeFromSave(save: ColonySave): GardenLife {
  return {
    colonyTime: save.colonyTime,
    nextId: save.nextId,
    lastClutchAt: save.lastClutchAt,
    critters: save.critters.map(item => ({ ...item })),
  };
}

export function freshColony(nowMs: number): ColonyRuntime {
  return { life: emptyColony(), paused: false, lastSimTimestamp: nowMs, wallMs: nowMs };
}

/** Advance saved colony from lastSimTimestamp toward now. Paused saves stay frozen. */
export function catchUpColony(save: ColonySave, nowMs: number): ColonyRuntime {
  const life = lifeFromSave(save);
  if (save.paused) return { life, paused: true, lastSimTimestamp: save.lastSimTimestamp, wallMs: nowMs };
  const elapsed = Math.max(0, (nowMs - save.lastSimTimestamp) / 1000);
  const simulated = Math.min(CATCH_UP_MAX_S, elapsed);
  const advanced = advanceGardenLife(life, life.colonyTime, life.colonyTime + simulated, CATCH_UP_STEP_S);
  return { life: advanced, paused: false, lastSimTimestamp: nowMs, wallMs: nowMs };
}

export type ColonyStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readColony(store: ColonyStore | undefined, nowMs: number): ColonyRuntime {
  if (!store) return freshColony(nowMs);
  try {
    const raw = store.getItem(COLONY_STORAGE_KEY);
    if (!raw) return freshColony(nowMs);
    const parsed = parseColonySave(JSON.parse(raw) as unknown);
    if (!parsed) return freshColony(nowMs);
    return catchUpColony(parsed, nowMs);
  } catch {
    return freshColony(nowMs);
  }
}

export function writeColony(store: ColonyStore | undefined, runtime: Omit<ColonyRuntime, 'wallMs'>): void {
  if (!store) return;
  try {
    store.setItem(COLONY_STORAGE_KEY, JSON.stringify(toColonySave(runtime)));
  } catch {
    /* quota or private mode — colony still runs in memory */
  }
}

export function clearColony(store: ColonyStore | undefined): void {
  try { store?.removeItem(COLONY_STORAGE_KEY); } catch { /* ignore */ }
}
