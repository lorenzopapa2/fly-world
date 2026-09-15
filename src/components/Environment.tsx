import { countStages, positionAt, simulateGardenLife, type GardenCritter } from '../lib/gardenLife';

/** Outdoor small garden (室外小花园). Visual world only — `time` drives ambient motion and a toy life layer, not a model. */

function wrap(value: number, span: number) {
  return ((value % span) + span) % span;
}

function Bloom({
  x,
  y,
  petal,
  sway,
  size = 1,
}: {
  x: number;
  y: number;
  petal: string;
  sway: number;
  size?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${size})`}>
      <path d="M0 2 C1 10 1 16 0 20 C-1 16 -1 10 0 2" fill="#3f7a38" />
      <circle cx="-4.4" cy="-1.2" r="4.3" fill={petal} />
      <circle cx="4.4" cy="-1.2" r="4.3" fill={petal} />
      <circle cx="0" cy="-4.8" r="4.3" fill={petal} />
      <circle cx="0" cy="2" r="4.1" fill={petal} />
      <circle cx="0" cy="-1" r="2.15" fill="#f3de7a" />
    </g>
  );
}

function FruitFly({
  x,
  y,
  angle,
  scale,
  body,
}: {
  x: number;
  y: number;
  angle: number;
  scale: number;
  body: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} opacity=".92">
      <ellipse cx="0" cy="0" rx="4.4" ry="2.15" fill={body} />
      <ellipse cx="-4.6" cy="-.6" rx="4.2" ry="1.15" fill="#d5e0d4" opacity=".78" />
      <ellipse cx="4.3" cy="-.45" rx="3.9" ry="1.05" fill="#d5e0d4" opacity=".78" />
      <circle cx="3.6" cy="-.2" r=".75" fill="#1a1410" />
    </g>
  );
}

function Egg({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx="0" cy="0" rx="3.5" ry="2.3" fill="#f3e6c4" stroke="#c9b48a" strokeWidth=".4" />
      <ellipse cx="-.8" cy="-.5" rx="1.3" ry=".7" fill="#fff8e6" opacity=".7" />
    </g>
  );
}

function Butterfly({
  x,
  y,
  flap,
  angle,
  color,
}: {
  x: number;
  y: number;
  flap: number;
  angle: number;
  color: string;
}) {
  const wing = 0.28 + flap * 0.72;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx={-5.2 * wing} cy="-1.8" rx={6.2 * wing} ry="3.4" fill={color} opacity=".92" />
      <ellipse cx={5.2 * wing} cy="-1.8" rx={6.2 * wing} ry="3.4" fill={color} opacity=".92" />
      <ellipse cx={-3.8 * wing} cy="2.4" rx={3.4 * wing} ry="2.1" fill={color} opacity=".75" />
      <ellipse cx={3.8 * wing} cy="2.4" rx={3.4 * wing} ry="2.1" fill={color} opacity=".75" />
      <path d="M0 -3.2v7.4" stroke="#3a2a18" strokeWidth=".85" strokeLinecap="round" />
    </g>
  );
}

export function Environment({ time }: { time: number }) {
  const breeze = Math.sin(time * 0.68);
  const gust = Math.sin(time * 1.12 + 0.9);
  const cloudA = wrap(48 + time * 5.5, 560) - 50;
  const cloudB = wrap(250 + time * 3.6, 580) - 40;
  const leafSway = breeze * 5.5 + gust * 1.8;
  const life = simulateGardenLife(time);
  const counts = countStages(life.critters);
  const monarch = {
    x: 210 + Math.sin(time * 0.52) * 100 + Math.sin(time * 1.25) * 16,
    y: 92 + Math.cos(time * 0.41) * 22 + Math.sin(time * 0.88) * 8,
    flap: Math.abs(Math.sin(time * 9.4)),
    angle: Math.sin(time * 0.52) * 16,
  };
  const cabbage = {
    x: 300 + Math.sin(time * 0.47 + 2.1) * 78 + Math.cos(time * 1.05) * 12,
    y: 118 + Math.cos(time * 0.36 + 1.4) * 20,
    flap: Math.abs(Math.sin(time * 8.2 + 1)),
    angle: Math.sin(time * 0.47 + 2.1) * 14,
  };

  const grasses = [
    [16, 28, 0.2],
    [34, 22, 1.1],
    [54, 30, 0.6],
    [76, 20, 2.0],
    [98, 26, 1.4],
    [122, 18, 0.3],
    [148, 29, 1.8],
    [286, 24, 1.6],
    [312, 20, 0.4],
    [338, 28, 2.2],
    [362, 19, 1.0],
    [386, 26, 0.7],
    [410, 21, 1.9],
    [434, 29, 0.1],
    [456, 20, 1.3],
    [472, 25, 0.8],
  ] as const;

  return (
    <div className="environment garden">
      <svg
        viewBox="0 0 480 400"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Cozy outdoor small garden with a toy fruit-fly life layer: adults, eggs and young"
      >
        <defs>
          <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4f9ec8" />
            <stop offset=".45" stopColor="#8ecbe0" />
            <stop offset=".78" stopColor="#e7d3a6" />
            <stop offset="1" stopColor="#f2e0b6" />
          </linearGradient>
          <radialGradient id="garden-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff6c8" />
            <stop offset=".55" stopColor="#ffe08a" />
            <stop offset="1" stopColor="#ffc35a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="garden-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d9a62" />
            <stop offset="1" stopColor="#4f7a4a" />
          </linearGradient>
          <linearGradient id="garden-lawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6eab55" />
            <stop offset=".55" stopColor="#4f8f42" />
            <stop offset="1" stopColor="#3b6f34" />
          </linearGradient>
          <radialGradient id="garden-canopy" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#6db35a" />
            <stop offset="1" stopColor="#2f6a38" />
          </radialGradient>
        </defs>

        <rect width="480" height="400" fill="url(#garden-sky)" />
        <circle cx="392" cy="58" r="68" fill="url(#garden-sun)" />
        <circle cx="392" cy="58" r="24" fill="#fff4b8" />

        <g opacity=".88">
          <ellipse cx={cloudA} cy="48" rx="38" ry="14" fill="#f7fbff" />
          <ellipse cx={cloudA + 24} cy="44" rx="24" ry="12" fill="#ffffff" />
          <ellipse cx={cloudA - 18} cy="50" rx="20" ry="10" fill="#eef6fc" />
          <ellipse cx={cloudB} cy="72" rx="44" ry="15" fill="#f4f9fd" opacity=".9" />
          <ellipse cx={cloudB + 26} cy="68" rx="22" ry="11" fill="#ffffff" opacity=".85" />
        </g>

        <path d="M-12 168 C90 146 170 164 250 154 C340 142 410 160 492 148 L492 230 L-12 230 Z" fill="url(#garden-hill)" />
        <path d="M-12 188 C100 172 190 196 280 178 C360 164 420 184 492 172 L492 240 L-12 240 Z" fill="#4d7d48" />

        <rect x="-10" y="214" width="500" height="13" fill="#8d6844" />
        {Array.from({ length: 18 }, (_, i) => {
          const x = 8 + i * 27;
          return <rect key={i} x={x} y="188" width="7" height="39" rx="1" fill={i % 2 ? '#9a734c' : '#7d5a36'} />;
        })}
        <rect x="-10" y="186" width="500" height="6" fill="#c49a68" />

        <path d="M-12 232 C90 220 180 238 270 226 C360 214 420 236 492 222 L492 400 L-12 400 Z" fill="url(#garden-lawn)" />

        <g transform={`translate(96 246) rotate(${leafSway * 0.35})`}>
          <path d="M0 0 C-8 -36 -10 -78 -4 -112" stroke="#6b452c" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="-2" cy="-116" rx="56" ry="40" fill="url(#garden-canopy)" transform={`rotate(${leafSway * 0.2})`} />
          <ellipse cx="-30" cy="-102" rx="34" ry="23" fill="#3f8a46" transform={`rotate(${-4 + leafSway})`} />
          <ellipse cx="28" cy="-104" rx="32" ry="21" fill="#4f9a4e" transform={`rotate(${6 + leafSway * 0.6})`} />
          <circle cx="-20" cy="-94" r="5.5" fill="#e07a42" />
          <circle cx="8" cy="-108" r="5" fill="#d45b3c" />
          <circle cx="24" cy="-88" r="5.2" fill="#e28a4a" />
          <circle cx="-6" cy="-122" r="4.6" fill="#c94c3a" />
        </g>
        <ellipse cx="104" cy="250" rx="22" ry="5" fill="#2f5a2c" opacity=".35" />

        <g opacity=".95">
          <path d="M196 400 C210 350 228 312 248 278 C264 252 286 234 304 216" fill="none" stroke="#c8b89a" strokeWidth="40" strokeLinecap="round" />
          <path d="M196 400 C210 350 228 312 248 278 C264 252 286 234 304 216" fill="none" stroke="#b7a484" strokeWidth="26" strokeLinecap="round" />
          {[
            [202, 386, 15, 6.5],
            [212, 360, 14, 6],
            [224, 334, 14, 6],
            [236, 308, 13, 5.6],
            [250, 284, 13, 5.4],
            [266, 260, 12, 5],
            [282, 240, 11, 4.8],
            [298, 222, 10, 4.4],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? '#d8cbb0' : '#c2b194'} opacity=".95" />
          ))}
        </g>

        <g transform={`translate(400 268) rotate(${breeze * 2})`}>
          <ellipse cx="0" cy="16" rx="28" ry="8" fill="#3a5c30" opacity=".3" />
          <ellipse cx="0" cy="8" rx="26" ry="13" fill="#6a4e32" />
          <ellipse cx="-6" cy="3" rx="16" ry="8" fill="#5a4028" />
          <ellipse cx="10" cy="5" rx="12" ry="7" fill="#7a5a38" />
          <path d="M-14 1 q6 -10 2 -16" stroke="#8a6a40" strokeWidth="2.2" fill="none" />
          <circle cx="8" cy="-1" r="4" fill="#d86a3a" />
          <ellipse cx="-4" cy="-3" rx="5" ry="3.2" fill="#c4a05a" />
          <path d="M-18 7 h10 q2 4 -2 6h-8z" fill="#8f6b3a" />
        </g>

        <g transform={`translate(328 312) rotate(${-8 + breeze})`}>
          <ellipse cx="0" cy="0" rx="9" ry="7" fill="#e28a48" />
          <ellipse cx="-2" cy="-1" rx="3" ry="2" fill="#f0b06a" opacity=".7" />
          <path d="M6 -4 c4 -6 8 -2 6 2" stroke="#5a7a38" strokeWidth="1.4" fill="none" />
        </g>

        <Bloom x={58} y={286} petal="#e8a0b4" sway={breeze * 6} size={1.08} />
        <Bloom x={88} y={308} petal="#f0d36a" sway={gust * 5} size={0.9} />
        <Bloom x={136} y={292} petal="#c9a0de" sway={breeze * -4.5} size={0.98} />
        <Bloom x={46} y={334} petal="#f2c3d4" sway={gust * 4} size={0.8} />
        <Bloom x={112} y={348} petal="#f6e08a" sway={breeze * 5.5} size={0.88} />
        <Bloom x={368} y={336} petal="#e89ab0" sway={gust * -5} size={0.92} />
        <Bloom x={412} y={352} petal="#d8b4f0" sway={breeze * 4.2} size={0.82} />
        <Bloom x={444} y={318} petal="#f3d56e" sway={gust * 6} size={1.02} />
        <Bloom x={168} y={356} petal="#efb0c2" sway={breeze * -3.5} size={0.74} />

        <g transform={`translate(32 262) rotate(${breeze * 4})`}>
          <path d="M0 36 C-2 18 2 8 0 0" stroke="#3d6e36" strokeWidth="3" fill="none" />
          <ellipse cx="-10" cy="8" rx="12" ry="5" fill="#4f8a40" transform="rotate(-28)" />
          <ellipse cx="10" cy="4" rx="13" ry="5.5" fill="#5a9a48" transform="rotate(32)" />
          <ellipse cx="-6" cy="18" rx="11" ry="4.5" fill="#3f7a38" transform="rotate(-18)" />
        </g>
        <g transform={`translate(452 252) rotate(${gust * 5})`}>
          <path d="M0 40 C2 20 -1 10 0 0" stroke="#356634" strokeWidth="3.2" fill="none" />
          <ellipse cx="12" cy="10" rx="14" ry="5.5" fill="#4a8640" transform="rotate(24)" />
          <ellipse cx="-11" cy="16" rx="12" ry="5" fill="#3d7838" transform="rotate(-30)" />
        </g>

        {grasses.map(([x, h, phase], i) => {
          const sway = Math.sin(time * 1.25 + phase) * 7 + breeze * 3;
          return (
            <path
              key={i}
              d={`M${x} 396 C${x + sway * 0.6} ${396 - h * 0.55}, ${x + sway} ${396 - h * 0.88}, ${x + sway * 0.35} ${396 - h}`}
              fill="none"
              stroke={i % 3 === 0 ? '#2f6a30' : i % 3 === 1 ? '#4a8a3c' : '#67a64c'}
              strokeWidth="1.55"
              strokeLinecap="round"
            />
          );
        })}

        <Butterfly x={monarch.x} y={monarch.y} flap={monarch.flap} angle={monarch.angle} color="#e07a32" />
        <Butterfly x={cabbage.x} y={cabbage.y} flap={cabbage.flap} angle={cabbage.angle} color="#f4f0dc" />

        {life.critters.map((critter: GardenCritter) => {
          const pose = positionAt(critter, time, life);
          if (critter.stage === 'egg') return <Egg key={critter.id} x={pose.x} y={pose.y} angle={pose.angle} />;
          const young = critter.stage === 'young';
          return (
            <FruitFly
              key={critter.id}
              x={pose.x}
              y={pose.y}
              angle={pose.angle}
              scale={young ? 0.78 : 1.25}
              body={young ? '#6a5340' : critter.id % 2 ? '#3a2a1c' : '#5a3d24'}
            />
          );
        })}
      </svg>
      <div className="garden-life-caption">
        <p>
          Toy garden ecology · {counts.adults} adult{counts.adults === 1 ? '' : 's'} · {counts.eggs} egg
          {counts.eggs === 1 ? '' : 's'} · {counts.young} young
        </p>
        <span>Cartoon life rules on the garden clock. Not MaleCNS-driven reproduction and not validated fly behavior.</span>
      </div>
    </div>
  );
}
