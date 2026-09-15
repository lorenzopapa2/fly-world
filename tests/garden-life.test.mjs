import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATCH_UP_MAX_S,
  HATCH_AFTER_S,
  GROW_AFTER_S,
  MAX_ADULTS,
  MAX_EGGS,
  countStages,
  formatColonyAge,
  nightAmount,
  positionAt,
  simulateGardenLife,
} from '../src/lib/gardenLife.ts';
import {
  catchUpColony,
  parseColonySave,
  toColonySave,
  freshColony,
} from '../src/lib/gardenColony.ts';

test('garden starts with exactly two adult flies and no eggs', () => {
  const life = simulateGardenLife(0);
  const counts = countStages(life.critters);
  assert.equal(counts.adults, 2);
  assert.equal(counts.eggs, 0);
  assert.equal(counts.young, 0);
});

test('the same colony time always replays the same cartoon life history', () => {
  const a = simulateGardenLife(18);
  const b = simulateGardenLife(18);
  assert.deepEqual(a, b);
});

test('adults meet, lay eggs, eggs hatch, young grow — under the population cap', () => {
  const early = countStages(simulateGardenLife(1).critters);
  assert.equal(early.adults, 2);

  let firstEggs = 0;
  for (let t = 0; t <= 12; t += 0.25) {
    const counts = countStages(simulateGardenLife(t).critters);
    if (counts.eggs > 0) { firstEggs = t; break; }
  }
  assert.ok(firstEggs > 0 && firstEggs < 8, `expected a first clutch, saw eggs at t=${firstEggs}`);

  const hatched = countStages(simulateGardenLife(firstEggs + HATCH_AFTER_S + 2, 1).critters);
  assert.ok(hatched.young >= 1 || hatched.adults > 2, 'eggs should hatch into young flies');

  const grown = countStages(simulateGardenLife(firstEggs + HATCH_AFTER_S + GROW_AFTER_S + 2, 1).critters);
  assert.ok(grown.adults >= 3, 'young should grow into extra adults');

  const late = countStages(simulateGardenLife(8 * 3600, 5).critters);
  assert.ok(late.adults <= MAX_ADULTS, 'adults stay at the soft cap');
  assert.ok(late.eggs <= MAX_EGGS, 'eggs stay at the soft cap');
  assert.ok(late.adults >= 3, 'population should grow from the founding pair');
});

test('seek and wander poses stay inside the garden', () => {
  const life = simulateGardenLife(6);
  for (const critter of life.critters) {
    const pose = positionAt(critter, 6, life);
    assert.ok(pose.x > 20 && pose.x < 470);
    assert.ok(pose.y > 200 && pose.y < 390);
  }
});

test('catch-up from a saved timestamp advances offline hours and caps long gaps', () => {
  const origin = 1_700_000_000_000;
  const started = simulateGardenLife(2);
  const saved = toColonySave({
    life: started,
    paused: false,
    lastSimTimestamp: origin,
  });
  const later = catchUpColony(saved, origin + (HATCH_AFTER_S + 5) * 1000);
  const counts = countStages(later.life.critters);
  assert.ok(counts.young >= 1 || counts.adults > 2, 'offline catch-up should hatch the first clutch');
  assert.equal(later.lastSimTimestamp, origin + (HATCH_AFTER_S + 5) * 1000);

  const capped = catchUpColony(saved, origin + 72 * 3600 * 1000);
  assert.ok(capped.life.colonyTime - saved.colonyTime <= CATCH_UP_MAX_S + 1);
  assert.ok(countStages(capped.life.critters).adults <= MAX_ADULTS);
});

test('a paused save does not grow during catch-up', () => {
  const origin = 1_700_000_000_000;
  const started = simulateGardenLife(2);
  const saved = toColonySave({ life: started, paused: true, lastSimTimestamp: origin });
  const later = catchUpColony(saved, origin + 3600 * 1000);
  assert.deepEqual(later.life.critters, started.critters);
  assert.equal(later.life.colonyTime, started.colonyTime);
  assert.equal(later.paused, true);
});

test('corrupt or tiny saves are rejected so the colony can start clean', () => {
  assert.equal(parseColonySave(null), null);
  assert.equal(parseColonySave({ version: 2 }), null);
  assert.equal(parseColonySave({
    version: 1,
    colonyTime: 1,
    lastSimTimestamp: 1,
    paused: false,
    nextId: 2,
    lastClutchAt: 0,
    critters: [{ id: 0, stage: 'adult', bornAt: 0, nestX: 1, nestY: 1 }],
  }), null);
  const fresh = freshColony(10);
  assert.equal(fresh.life.critters.length, 2);
  assert.equal(formatColonyAge(3661), '1h 1m');
  assert.ok(nightAmount(0) > 0.95);
  assert.ok(nightAmount(12) < 0.05);
});
