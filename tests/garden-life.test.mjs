import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateGardenLife, countStages, positionAt, MAX_ADULTS, MAX_EGGS } from '../src/lib/gardenLife.ts';

test('garden starts with exactly two adult flies and no eggs', () => {
  const life = simulateGardenLife(0);
  const counts = countStages(life.critters);
  assert.equal(counts.adults, 2);
  assert.equal(counts.eggs, 0);
  assert.equal(counts.young, 0);
});

test('the same clock time always replays the same cartoon life history', () => {
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

  const hatched = countStages(simulateGardenLife(firstEggs + 4.2).critters);
  assert.ok(hatched.young >= 1 || hatched.adults > 2, 'eggs should hatch into young flies');

  const grown = countStages(simulateGardenLife(firstEggs + 9.2).critters);
  assert.ok(grown.adults >= 3, 'young should grow into extra adults');

  const late = countStages(simulateGardenLife(60).critters);
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
