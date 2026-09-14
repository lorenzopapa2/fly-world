/** Outdoor small garden (室外小花园). Visual world only — `time` drives ambient motion, not a model. */

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
  const cloudA = wrap(36 + time * 5.5, 480) - 50;
  const cloudB = wrap(210 + time * 3.6, 500) - 40;
  const leafSway = breeze * 5.5 + gust * 1.8;
  const fly = {
    x: 268 + Math.sin(time * 1.7) * 7 + Math.sin(time * 3.1) * 3,
    y: 392 + Math.cos(time * 2.1) * 5,
  };
  const monarch = {
    x: 168 + Math.sin(time * 0.52) * 92 + Math.sin(time * 1.25) * 16,
    y: 148 + Math.cos(time * 0.41) * 32 + Math.sin(time * 0.88) * 10,
    flap: Math.abs(Math.sin(time * 9.4)),
    angle: Math.sin(time * 0.52) * 16,
  };
  const cabbage = {
    x: 248 + Math.sin(time * 0.47 + 2.1) * 70 + Math.cos(time * 1.05) * 12,
    y: 186 + Math.cos(time * 0.36 + 1.4) * 28,
    flap: Math.abs(Math.sin(time * 8.2 + 1)),
    angle: Math.sin(time * 0.47 + 2.1) * 14,
  };

  const grasses = [
    [18, 34, 0.2],
    [32, 28, 1.1],
    [48, 38, 0.6],
    [64, 26, 2.0],
    [82, 33, 1.4],
    [104, 24, 0.3],
    [128, 36, 1.8],
    [154, 22, 0.9],
    [248, 30, 1.6],
    [272, 26, 0.4],
    [296, 35, 2.2],
    [318, 24, 1.0],
    [338, 32, 0.7],
    [356, 27, 1.9],
    [374, 36, 0.1],
    [388, 25, 1.3],
  ] as const;

  return (
    <div className="environment garden">
      <svg
        viewBox="0 0 400 520"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Cozy outdoor small garden with a stone path, flowers, a fruit tree, compost, and sunlight"
      >
        <defs>
          <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4f9ec8" />
            <stop offset=".42" stopColor="#8ecbe0" />
            <stop offset=".72" stopColor="#e7d3a6" />
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
          <linearGradient id="garden-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b88858" />
            <stop offset="1" stopColor="#7a5332" />
          </linearGradient>
        </defs>

        <rect width="400" height="520" fill="url(#garden-sky)" />
        <circle cx="308" cy="78" r="62" fill="url(#garden-sun)" />
        <circle cx="308" cy="78" r="22" fill="#fff4b8" />

        <g opacity=".88">
          <ellipse cx={cloudA} cy="64" rx="36" ry="14" fill="#f7fbff" />
          <ellipse cx={cloudA + 22} cy="60" rx="24" ry="12" fill="#ffffff" />
          <ellipse cx={cloudA - 18} cy="66" rx="20" ry="10" fill="#eef6fc" />
          <ellipse cx={cloudB} cy="92" rx="42" ry="15" fill="#f4f9fd" opacity=".9" />
          <ellipse cx={cloudB + 26} cy="88" rx="22" ry="11" fill="#ffffff" opacity=".85" />
        </g>

        <path d="M-10 248 C70 220 140 236 210 228 C280 220 340 236 410 218 L410 300 L-10 300 Z" fill="url(#garden-hill)" />
        <path d="M-10 268 C90 250 170 274 250 258 C320 246 360 262 410 250 L410 320 L-10 320 Z" fill="#4d7d48" />

        <rect x="-8" y="286" width="416" height="14" fill="#8d6844" />
        {Array.from({ length: 15 }, (_, i) => {
          const x = 6 + i * 27;
          return <rect key={i} x={x} y="258" width="7" height="42" rx="1" fill={i % 2 ? '#9a734c' : '#7d5a36'} />;
        })}
        <rect x="-8" y="256" width="416" height="6" fill="#c49a68" />

        <path d="M-10 312 C80 300 160 318 230 306 C300 294 350 316 410 302 L410 520 L-10 520 Z" fill="url(#garden-lawn)" />

        <g transform={`translate(78 318) rotate(${leafSway * 0.35})`}>
          <path d="M0 0 C-8 -40 -10 -88 -4 -128" stroke="#6b452c" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="-2" cy="-132" rx="54" ry="42" fill="url(#garden-canopy)" transform={`rotate(${leafSway * 0.2})`} />
          <ellipse cx="-28" cy="-118" rx="32" ry="24" fill="#3f8a46" transform={`rotate(${-4 + leafSway})`} />
          <ellipse cx="26" cy="-120" rx="30" ry="22" fill="#4f9a4e" transform={`rotate(${6 + leafSway * 0.6})`} />
          <circle cx="-18" cy="-108" r="5.5" fill="#e07a42" />
          <circle cx="8" cy="-124" r="5" fill="#d45b3c" />
          <circle cx="22" cy="-102" r="5.2" fill="#e28a4a" />
          <circle cx="-6" cy="-140" r="4.6" fill="#c94c3a" />
        </g>
        <ellipse cx="86" cy="322" rx="22" ry="5" fill="#2f5a2c" opacity=".35" />

        <g opacity=".95">
          <path d="M168 520 C176 470 188 430 204 392 C218 360 236 338 248 318" fill="none" stroke="#c8b89a" strokeWidth="42" strokeLinecap="round" />
          <path d="M168 520 C176 470 188 430 204 392 C218 360 236 338 248 318" fill="none" stroke="#b7a484" strokeWidth="28" strokeLinecap="round" />
          {[
            [174, 498, 16, 7],
            [182, 472, 14, 6],
            [190, 446, 15, 6.5],
            [198, 418, 13, 6],
            [208, 392, 14, 5.8],
            [220, 366, 12, 5.4],
            [232, 344, 11, 5],
            [244, 324, 10, 4.6],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? '#d8cbb0' : '#c2b194'} opacity=".95" />
          ))}
        </g>

        <g transform={`translate(322 356) rotate(${breeze * 2})`}>
          <ellipse cx="0" cy="18" rx="28" ry="8" fill="#3a5c30" opacity=".3" />
          <ellipse cx="0" cy="10" rx="26" ry="14" fill="#6a4e32" />
          <ellipse cx="-6" cy="4" rx="16" ry="8" fill="#5a4028" />
          <ellipse cx="10" cy="6" rx="12" ry="7" fill="#7a5a38" />
          <path d="M-14 2 q6 -10 2 -16" stroke="#8a6a40" strokeWidth="2.2" fill="none" />
          <circle cx="8" cy="0" r="4" fill="#d86a3a" />
          <ellipse cx="-4" cy="-2" rx="5" ry="3.2" fill="#c4a05a" />
          <path d="M-18 8 h10 q2 4 -2 6h-8z" fill="#8f6b3a" />
        </g>

        <g transform={`translate(262 404) rotate(${-8 + breeze})`}>
          <ellipse cx="0" cy="0" rx="9" ry="7" fill="#e28a48" />
          <ellipse cx="-2" cy="-1" rx="3" ry="2" fill="#f0b06a" opacity=".7" />
          <path d="M6 -4 c4 -6 8 -2 6 2" stroke="#5a7a38" strokeWidth="1.4" fill="none" />
        </g>

        <Bloom x={52} y={368} petal="#e8a0b4" sway={breeze * 6} size={1.05} />
        <Bloom x={78} y={392} petal="#f0d36a" sway={gust * 5} size={0.88} />
        <Bloom x={118} y={376} petal="#c9a0de" sway={breeze * -4.5} size={0.95} />
        <Bloom x={40} y={424} petal="#f2c3d4" sway={gust * 4} size={0.78} />
        <Bloom x={96} y={438} petal="#f6e08a" sway={breeze * 5.5} size={0.86} />
        <Bloom x={300} y={428} petal="#e89ab0" sway={gust * -5} size={0.9} />
        <Bloom x={338} y={448} petal="#d8b4f0" sway={breeze * 4.2} size={0.8} />
        <Bloom x={364} y={412} petal="#f3d56e" sway={gust * 6} size={1} />
        <Bloom x={146} y={454} petal="#efb0c2" sway={breeze * -3.5} size={0.72} />

        <g transform={`translate(28 348) rotate(${breeze * 4})`}>
          <path d="M0 40 C-2 20 2 8 0 0" stroke="#3d6e36" strokeWidth="3" fill="none" />
          <ellipse cx="-10" cy="8" rx="12" ry="5" fill="#4f8a40" transform="rotate(-28)" />
          <ellipse cx="10" cy="4" rx="13" ry="5.5" fill="#5a9a48" transform="rotate(32)" />
          <ellipse cx="-6" cy="20" rx="11" ry="4.5" fill="#3f7a38" transform="rotate(-18)" />
        </g>
        <g transform={`translate(368 338) rotate(${gust * 5})`}>
          <path d="M0 46 C2 22 -1 10 0 0" stroke="#356634" strokeWidth="3.2" fill="none" />
          <ellipse cx="12" cy="10" rx="14" ry="5.5" fill="#4a8640" transform="rotate(24)" />
          <ellipse cx="-11" cy="16" rx="12" ry="5" fill="#3d7838" transform="rotate(-30)" />
        </g>

        {grasses.map(([x, h, phase], i) => {
          const sway = Math.sin(time * 1.25 + phase) * 7 + breeze * 3;
          return (
            <path
              key={i}
              d={`M${x} 508 C${x + sway * 0.6} ${508 - h * 0.55}, ${x + sway} ${508 - h * 0.88}, ${x + sway * 0.35} ${508 - h}`}
              fill="none"
              stroke={i % 3 === 0 ? '#2f6a30' : i % 3 === 1 ? '#4a8a3c' : '#67a64c'}
              strokeWidth="1.55"
              strokeLinecap="round"
            />
          );
        })}

        <g opacity=".55">
          <path d={`M${12 + breeze} 470 C20 450 18 430 26 412`} stroke="#2d5c2c" strokeWidth="1.2" fill="none" />
          <path d={`M${388 + gust} 478 C380 456 384 438 374 418`} stroke="#2d5c2c" strokeWidth="1.2" fill="none" />
        </g>

        <Butterfly x={monarch.x} y={monarch.y} flap={monarch.flap} angle={monarch.angle} color="#e07a32" />
        <Butterfly x={cabbage.x} y={cabbage.y} flap={cabbage.flap} angle={cabbage.angle} color="#f4f0dc" />

        <g transform={`translate(${fly.x} ${fly.y})`} opacity=".85">
          <ellipse cx="0" cy="0" rx="2.1" ry="1.15" fill="#2a241c" />
          <ellipse cx="-2.6" cy="-.4" rx="2.4" ry=".7" fill="#c8d4c0" opacity=".7" />
          <ellipse cx="2.4" cy="-.3" rx="2.2" ry=".65" fill="#c8d4c0" opacity=".7" />
        </g>
      </svg>
    </div>
  );
}
