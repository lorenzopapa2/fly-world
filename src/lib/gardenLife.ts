/** Toy garden ecology. Deterministic cartoon rules — not MaleCNS biology. */

export const GARDEN_CLOCK_S = 60;
export const MAX_ADULTS = 8;
export const MAX_EGGS = 5;
export const HATCH_AFTER_S = 4;
export const GROW_AFTER_S = 5;
export const MATE_RADIUS = 22;
export const MATE_COOLDOWN_S = 8;
export const STEP_S = 0.05;

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

function founders(): GardenCritter[] {
  return [
    { id: 0, stage: 'adult', bornAt: 0, nestX: NEST.x, nestY: NEST.y },
    { id: 1, stage: 'adult', bornAt: 0, nestX: NEST.x, nestY: NEST.y },
  ];
}

/** Replayable life history for the garden clock. Same time always yields the same cartoon. */
export function simulateGardenLife(time: number): GardenLife {
  const until = Math.max(0, time);
  const life: GardenLife = { critters: founders(), lastClutchAt: -MATE_COOLDOWN_S };
  let nextId = 2;
  for (let step = STEP_S; step <= until + 1e-9; step += STEP_S) {
    let { adults, eggs } = countStages(life.critters);
    for (const critter of life.critters) {
      if (critter.stage === 'egg' && step - critter.bornAt >= HATCH_AFTER_S) critter.stage = 'young';
      else if (critter.stage === 'young' && step - critter.bornAt >= HATCH_AFTER_S + GROW_AFTER_S && adults < MAX_ADULTS) {
        critter.stage = 'adult';
        adults += 1;
      }
    }
    const grown = countStages(life.critters);
    if (grown.adults >= 2 && grown.adults < MAX_ADULTS && grown.eggs < MAX_EGGS && step - life.lastClutchAt >= MATE_COOLDOWN_S) {
      const posed = life.critters.filter(item => item.stage === 'adult').map(item => ({ item, pose: adultDrawPose(item, step, true) }));
      let laid = false;
      for (let i = 0; i < posed.length && !laid; i += 1) {
        for (let j = i + 1; j < posed.length; j += 1) {
          const dx = posed[i].pose.x - posed[j].pose.x;
          const dy = posed[i].pose.y - posed[j].pose.y;
          if (dx * dx + dy * dy > MATE_RADIUS * MATE_RADIUS) continue;
          const clutch = grown.eggs === 0 && grown.adults <= 2 ? 2 : 1;
          const count = Math.min(clutch, MAX_EGGS - grown.eggs, MAX_ADULTS - grown.adults);
          for (let n = 0; n < count; n += 1) {
            const jitter = nextId * 2.3;
            life.critters.push({
              id: nextId,
              stage: 'egg',
              bornAt: step,
              nestX: NEST.x - 8 + (jitter % 19),
              nestY: NEST.y + 10 + ((nextId * 5) % 11),
            });
            nextId += 1;
          }
          life.lastClutchAt = step;
          laid = true;
          break;
        }
      }
    }
  }
  return life;
}
