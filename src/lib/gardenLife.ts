/** Toy garden ecology. Cartoon rules — not MaleCNS biology. */

export const GARDEN_CLOCK_S = 60;
export const MAX_ADULTS = 8;
export const MAX_EGGS = 5;
/** Wall-clock hatch / grow so offline hours can still change the colony. */
export const HATCH_AFTER_S = 15 * 60;
export const GROW_AFTER_S = 25 * 60;
export const MATE_RADIUS = 22;
export const MATE_COOLDOWN_S = 12 * 60;
export const STEP_S = 0.05;
export const CATCH_UP_STEP_S = 5;
export const CATCH_UP_MAX_S = 24 * 3600;

export const NEST = { x: 368, y: 298 };

export type CritterStage = 'egg' | 'young' | 'adult';

export type GardenCritter = {
  id: number;
  stage: CritterStage;
  bornAt: number;
  nestX: number;
  nestY: number;
};

export type GardenLife = {
  colonyTime: number;
  nextId: number;
  critters: GardenCritter[];
  lastClutchAt: number;
};

export function countStages(critters: readonly GardenCritter[]) {
  let adults = 0, eggs = 0, young = 0;
  for (const critter of critters) {
    if (critter.stage === 'adult') adults += 1;
    else if (critter.stage === 'egg') eggs += 1;
    else young += 1;
  }
  return { adults, eggs, young, total: critters.length };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seed(id: number) {
  return id * 17.13 + 2.7;
}

export function emptyColony(): GardenLife {
  return {
    colonyTime: 0,
    nextId: 2,
    critters: [
      { id: 0, stage: 'adult', bornAt: 0, nestX: NEST.x, nestY: NEST.y },
      { id: 1, stage: 'adult', bornAt: 0, nestX: NEST.x, nestY: NEST.y },
    ],
    lastClutchAt: -MATE_COOLDOWN_S,
  };
}

export function cloneLife(life: GardenLife): GardenLife {
  return {
    colonyTime: life.colonyTime,
    nextId: life.nextId,
    lastClutchAt: life.lastClutchAt,
    critters: life.critters.map(critter => ({ ...critter })),
  };
}

export function poseAt(critter: GardenCritter, time: number): { x: number; y: number; angle: number } {
  if (critter.stage === 'egg') {
    return { x: critter.nestX, y: critter.nestY, angle: critter.id * 18 };
  }
  const phase = seed(critter.id);
  if (critter.stage === 'young') {
    const age = time - critter.bornAt - HATCH_AFTER_S;
    const orbit = 10 + (critter.id % 3) * 3;
    return {
      x: critter.nestX + Math.sin(time * 1.6 + phase) * orbit,
      y: critter.nestY - 8 + Math.cos(time * 1.3 + phase) * 7 - Math.min(12, age * 1.4),
      angle: Math.sin(time * 1.6 + phase) * 22,
    };
  }
  const homeX = critter.id % 2 === 0 ? 140 : 390;
  const homeY = 292 + (critter.id % 5) * 6;
  const wanderX = homeX + Math.sin(time * 0.85 + phase) * 46 + Math.sin(time * 1.55 + phase * 1.7) * 14;
  const wanderY = homeY + Math.cos(time * 0.72 + phase) * 20 + Math.sin(time * 1.1 + phase) * 8;
  return {
    x: clamp(wanderX, 36, 452),
    y: clamp(wanderY, 236, 368),
    angle: Math.sin(time * 0.85 + phase) * 18,
  };
}

function seekingMate(life: GardenLife, time: number) {
  const { adults, eggs } = countStages(life.critters);
  return adults >= 2 && adults < MAX_ADULTS && eggs < MAX_EGGS && time - life.lastClutchAt >= MATE_COOLDOWN_S;
}

function adultDrawPose(critter: GardenCritter, time: number, seek: boolean) {
  const wander = poseAt(critter, time);
  if (!seek) return wander;
  const phase = seed(critter.id);
  return {
    x: NEST.x + Math.sin(time * 1.25 + phase) * 7 + (critter.id % 2 ? 5 : -5),
    y: NEST.y + Math.cos(time * 1.4 + phase) * 5,
    angle: wander.angle,
  };
}

export function positionAt(critter: GardenCritter, time: number, life: GardenLife) {
  if (critter.stage === 'adult') return adultDrawPose(critter, time, seekingMate(life, time));
  return poseAt(critter, time);
}

function stepOnce(life: GardenLife, time: number) {
  let { adults } = countStages(life.critters);
  for (const critter of life.critters) {
    if (critter.stage === 'egg' && time - critter.bornAt >= HATCH_AFTER_S) critter.stage = 'young';
    else if (critter.stage === 'young' && time - critter.bornAt >= HATCH_AFTER_S + GROW_AFTER_S && adults < MAX_ADULTS) {
      critter.stage = 'adult';
      adults += 1;
    }
  }
  const grown = countStages(life.critters);
  if (grown.adults >= 2 && grown.adults < MAX_ADULTS && grown.eggs < MAX_EGGS && time - life.lastClutchAt >= MATE_COOLDOWN_S) {
    const posed = life.critters.filter(item => item.stage === 'adult').map(item => ({ item, pose: adultDrawPose(item, time, true) }));
    let laid = false;
    for (let i = 0; i < posed.length && !laid; i += 1) {
      for (let j = i + 1; j < posed.length; j += 1) {
        const dx = posed[i].pose.x - posed[j].pose.x;
        const dy = posed[i].pose.y - posed[j].pose.y;
        if (dx * dx + dy * dy > MATE_RADIUS * MATE_RADIUS) continue;
        const clutch = grown.eggs === 0 && grown.adults <= 2 ? 2 : 1;
        const count = Math.min(clutch, MAX_EGGS - grown.eggs, MAX_ADULTS - grown.adults);
        for (let n = 0; n < count; n += 1) {
          const jitter = life.nextId * 2.3;
          life.critters.push({
            id: life.nextId,
            stage: 'egg',
            bornAt: time,
            nestX: NEST.x - 8 + (jitter % 19),
            nestY: NEST.y + 10 + ((life.nextId * 5) % 11),
          });
          life.nextId += 1;
        }
        life.lastClutchAt = time;
        laid = true;
        break;
      }
    }
  }
}

/** Advance an existing colony snapshot. `time` is colony seconds, not experiment-clock seconds. */
export function advanceGardenLife(source: GardenLife, fromTime: number, toTime: number, step = STEP_S): GardenLife {
  const life = cloneLife(source);
  const start = Math.max(0, fromTime);
  const end = Math.max(start, toTime);
  for (let time = start + step; time <= end + 1e-9; time += step) stepOnce(life, time);
  life.colonyTime = end;
  return life;
}

/** Replayable history from a fresh founding pair. Same time always yields the same cartoon. */
export function simulateGardenLife(time: number, step = STEP_S): GardenLife {
  return advanceGardenLife(emptyColony(), 0, time, step);
}

export function localHour(ms: number): number {
  const date = new Date(ms);
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/** 0 at local noon, 1 at local midnight. */
export function nightAmount(hour: number): number {
  return 0.5 + 0.5 * Math.cos((hour / 24) * Math.PI * 2);
}

export function formatColonyAge(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${total % 60}s`;
  return `${total}s`;
}
