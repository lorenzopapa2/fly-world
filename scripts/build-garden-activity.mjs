import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ids = readFileSync(join(root, 'public/data/brain-atlas/ids.bin'));
const groups = readFileSync(join(root, 'public/data/brain-atlas/groups.bin'));
const visible = [];
for (let i = 0; i < groups.length; i += 1) {
  if (groups[i] < 3) visible.push(ids.readUInt32LE(i * 4));
}
if (visible.length < 900) throw Error('Need enough visible MaleCNS IDs for the garden fixture.');

const cohorts = [visible.slice(0, 300), visible.slice(300, 600), visible.slice(600, 900)];
const frames = [];
for (let second = 0; second <= 30; second += 1) {
  if (second === 0) {
    frames.push({ time: 0, values: [] });
    continue;
  }
  const cohort = cohorts[(second - 1) % cohorts.length];
  const level = second % 2 === 1 ? 0.85 : 0.25;
  frames.push({
    time: second,
    values: cohort.map((id, index) => [id, Number((level - (index % 7) * 0.04).toFixed(2))]),
  });
}

const replay = {
  version: 1,
  dataset: 'male-cns:v1.0',
  source: {
    kind: 'synthetic',
    name: 'Garden-clock MaleCNS display fixture (authored; not from garden flies, not a trained model)',
    normalization: 'Authored display values in [0, 1]; no biological units.',
  },
  frames,
};

const out = join(root, 'public/examples/garden-fly-activity.example.json');
writeFileSync(out, JSON.stringify(replay));
console.log(`wrote ${out} (${replay.frames.length} frames, ${cohorts[0].length} IDs per active frame)`);
