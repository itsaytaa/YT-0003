// Advisory 0003: the washing machine (the episode's hero figure) and the tumbling
// motion shared with the drum close-up. Spec: assets-spec.md → `washing-machine`.
import React from "react";
import { C, FONT } from "../../theme";
import { lerp, rand } from "../../anim";
import type { CustomElementProps } from "../../episode-context";
import { SockShape, sockBox, useSafeId, type SockKind, type SockPattern } from "./sock";

// ---------------------------------------------------------------- tumbling
// Where a piece of washing is at phase u (0..1) of one tumble: it rides up the drum wall
// with the drum, lets go near the top and falls back to the bottom. Unit drum (r = 1),
// screen angles (90° = down). Returns position and a spin angle.
export function tumble(u: number, seed: number) {
  const ride = 0.62;
  const a0 = 90 - 18 + rand(seed) * 26; // where it lands
  const a1 = 205 + rand(seed + 3) * 40; // where it lets go (upper left)
  const r = 0.62 + rand(seed + 7) * 0.22;
  const toXY = (deg: number, rr: number) => ({ x: Math.cos((deg * Math.PI) / 180) * rr, y: Math.sin((deg * Math.PI) / 180) * rr });
  if (u < ride) {
    const p = u / ride;
    const a = lerp(a0, a1, p);
    const pt = toXY(a, r);
    return { ...pt, spin: a + rand(seed + 11) * 360 };
  }
  // fall: from the release point back to the landing point under gravity
  const p = (u - ride) / (1 - ride);
  const s = toXY(a1, r), e = toXY(a0 + 360, r * 0.98);
  const x = lerp(s.x, e.x, p);
  const y = s.y + (e.y - s.y) * p * p;
  return { x, y, spin: a1 + rand(seed + 11) * 360 + p * 140 };
}

// Drum angle in degrees at frame t. Old machines turn unevenly (speed ±30%).
export function drumAngle(t: number, fps: number, drum: string, old = false) {
  if (drum !== "spin" && drum !== "slow") return 0;
  const turnsPerSec = drum === "spin" ? 1 : 1 / 3;
  const w = 360 * turnsPerSec; // deg per second
  const s = t / fps;
  if (!old) return w * s;
  const P = 2.6;
  return w * s - ((w * 0.3 * P) / (2 * Math.PI)) * Math.cos((2 * Math.PI * s) / P);
}

const CONTENT_SOCKS: Array<{ kind: SockKind; pattern: SockPattern; color: "fg" | "dim" }> = [
  { kind: "yours", pattern: "stripe", color: "fg" },
  { kind: "yours", pattern: "plain", color: "dim" },
  { kind: "yours", pattern: "dots", color: "fg" },
  { kind: "yours", pattern: "heel", color: "dim" },
  { kind: "yours", pattern: "plain", color: "fg" },
];

// ---------------------------------------------------------------- machine
type MachineProps = {
  x: number;
  y: number;
  h: number;
  door?: "open" | "closed";
  drum?: string;
  contents?: string;
  display?: string;
  light?: string;
  color?: string;
  age?: string;
  t: number;
  fps: number;
};

export const Machine: React.FC<MachineProps> = ({ x, y, h, door = "closed", drum = "still", contents = "none", display, light, color = "fg", age, t, fps }) => {
  const id = useSafeId("wm");
  const w = 0.86 * h;
  const old = age === "old";
  const turning = drum === "spin" || drum === "slow";
  const body = color === "dim" ? C.dim : color === "grey" ? C.grey : C.fg;
  const filter = color === "fg" ? "url(#glow)" : "url(#glowSoft)";
  const top = y - h;
  const l = x - w / 2;

  // Body vibration: a fast 1–2 px buzz while spinning; old machines shudder every ~2.2 s.
  let vx = 0, vy = 0;
  if (drum === "spin") {
    vx = Math.sin(t * 2.7) * 1.2;
    vy = Math.cos(t * 3.3) * 0.8;
  }
  if (old && turning) {
    const s = t / fps;
    const ph = s % 2.2;
    if (ph < 0.3) {
      const k = Math.sin((ph / 0.3) * Math.PI);
      vx += Math.sin(t * 3.1) * 2 * k;
      vy += Math.cos(t * 4.3) * 1 * k;
    }
  }

  // Porthole.
  const pcx = x, pcy = top + 0.56 * h;
  const rOuter = 0.33 * w, rRimOut = 0.31 * w, rGlass = 0.27 * w;
  const ang = drumAngle(t, fps, drum, old);
  const led = light ?? (turning ? "blue" : "off");
  const ledColor = led === "off" ? C.line : C.blue;
  const ledOpacity = led === "dim" ? 0.35 : 1;

  // Control panel.
  const panelY = top + 0.05 * h, panelH = 0.12 * h;
  const pl = l + 0.06 * w, pw = w * 0.88;
  const dialR = 0.045 * h;
  const fontSize = panelH * 0.42;

  const glassContents = () => {
    if (contents === "socks") {
      const n = 5;
      return CONTENT_SOCKS.slice(0, n).map((s, i) => {
        const speed = drum === "spin" ? 1 : drum === "slow" ? 1 / 3 : 0;
        // At high speed the washing sticks to the wall and turns with the drum.
        if (drum === "spin") {
          const a = ((ang + i * (360 / n) + rand(i) * 30) * Math.PI) / 180;
          const rr = rGlass * (0.7 + rand(i + 5) * 0.12);
          const sz = rGlass * 0.72;
          const b = sockBox("flat", sz, s.kind);
          return (
            <g key={i} transform={`translate(${pcx + Math.cos(a) * rr} ${pcy + Math.sin(a) * rr}) rotate(${(a * 180) / Math.PI + 90}) translate(${-b.cx} ${-b.cy})`} opacity={s.color === "dim" ? 0.75 : 0.9}>
              <SockShape size={sz} kind={s.kind} pattern={s.pattern} color={s.color === "dim" ? C.dim : C.fg} detail={false} />
            </g>
          );
        }
        const u = ((((t / fps) * speed * 0.6 + i / n + rand(i * 3.7) * 0.08) % 1) + 1) % 1;
        const p = tumble(u, i * 5 + 1);
        const sz = rGlass * 0.8;
        const b = sockBox("flat", sz, s.kind);
        return (
          <g key={i} transform={`translate(${pcx + p.x * rGlass * 0.85} ${pcy + p.y * rGlass * 0.85}) rotate(${p.spin}) translate(${-b.cx} ${-b.cy})`} opacity={s.color === "dim" ? 0.75 : 0.9}>
            <SockShape size={sz} kind={s.kind} pattern={s.pattern} color={s.color === "dim" ? C.dim : C.fg} detail={false} />
          </g>
        );
      });
    }
    if (contents === "one-grey") {
      const sz = rGlass * 0.95;
      const b = sockBox("flat", sz, "theirs");
      return (
        <g transform={`translate(${pcx - b.w / 2 + rGlass * 0.04} ${pcy + rGlass * 0.78}) rotate(-4)`} filter="url(#glowSoft)">
          <SockShape size={sz} kind="theirs" />
        </g>
      );
    }
    return null;
  };

  const drumDots = (r: number, n: number, rad: number, op: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((ang + (i * 360) / n) * Math.PI) / 180;
      return <circle key={i} cx={pcx + Math.cos(a) * r} cy={pcy + Math.sin(a) * r} r={rad} fill={C.line} opacity={op} />;
    });

  const open = door === "open";
  // The open door: hinged at the left edge of the porthole, swung out to the left.
  const doorRx = 0.18 * w, doorRy = rOuter;
  const doorCx = pcx - rOuter - doorRx + 4;

  return (
    <g transform={`translate(${vx} ${vy})`}>
      <g filter={filter}>
        <rect x={l} y={top} width={w} height={h} rx={0.04 * h} fill={body} />
        {/* feet gap */}
        <rect x={l + 0.06 * w} y={y - 0.02 * h} width={w * 0.88} height={0.02 * h + 1} fill={C.bg} />
      </g>
      {/* control panel */}
      <rect x={pl} y={panelY} width={pw} height={panelH} rx={0.02 * h} fill={C.bg} />
      <rect x={pl + panelH * 0.25} y={panelY + panelH * 0.22} width={0.3 * w} height={panelH * 0.56} rx={panelH * 0.12} fill="none" stroke={C.dim} strokeWidth={Math.max(2, h * 0.006)} />
      <path d={`M${pl + panelH * 0.25 + 0.3 * w * 0.12} ${panelY + panelH * 0.5} h ${0.3 * w * 0.3}`} stroke={C.dim} strokeWidth={Math.max(1.5, h * 0.004)} strokeLinecap="round" opacity={0.7} />
      <g transform={`translate(${x + w * 0.04} ${panelY + panelH / 2}) rotate(${old ? -20 : 35})`}>
        <circle r={dialR} fill="none" stroke={C.dim} strokeWidth={Math.max(2, h * 0.007)} />
        <path d={`M0 ${-dialR * 0.35} V ${-dialR * 0.9}`} stroke={C.dim} strokeWidth={Math.max(2, h * 0.007)} strokeLinecap="round" />
      </g>
      <circle cx={x + w * 0.21} cy={panelY + panelH / 2} r={Math.max(3, h * 0.011)} fill={ledColor} opacity={ledOpacity} filter={led === "blue" ? "url(#glowBlue)" : undefined} />
      {display ? (
        <text x={pl + pw - panelH * 0.3} y={panelY + panelH / 2 + fontSize * 0.36} textAnchor="end" fontFamily={FONT.mono} fontWeight={600} fontSize={fontSize} letterSpacing="0.08em" fill={C.blue} opacity={old ? 0.5 : 1}>
          {display}
        </text>
      ) : (
        <rect x={pl + pw - panelH * 0.3 - w * 0.17} y={panelY + panelH * 0.3} width={w * 0.17} height={panelH * 0.4} rx={2} fill="none" stroke={C.line} strokeWidth={Math.max(1.5, h * 0.004)} opacity={0.8} />
      )}
      {/* porthole */}
      <circle cx={pcx} cy={pcy} r={rOuter} fill={C.bg} />
      {open ? (
        <g>
          {/* the dark opening of the drum */}
          <circle cx={pcx} cy={pcy} r={rRimOut} fill={C.surface2} opacity={0.5} />
          <circle cx={pcx} cy={pcy} r={rGlass * 1.04} fill={C.bg} />
          <circle cx={pcx} cy={pcy} r={rGlass * 0.72} fill="none" stroke={C.surface2} strokeWidth={Math.max(2, w * 0.01)} />
          {drumDots(rGlass * 0.55, 14, Math.max(1.6, w * 0.006), 0.8)}
        </g>
      ) : (
        <g>
          <clipPath id={id}>
            <circle cx={pcx} cy={pcy} r={rGlass} />
          </clipPath>
          <circle cx={pcx} cy={pcy} r={(rRimOut + rGlass) / 2} fill="none" stroke={C.surface2} strokeWidth={rRimOut - rGlass} opacity={old ? 0.6 : 1} />
          <circle cx={pcx} cy={pcy} r={rGlass} fill={C.surface} />
          <g clipPath={`url(#${id})`}>
            {drumDots(rGlass * 0.8, 18, Math.max(1.8, w * 0.007), 0.9)}
            {drumDots(rGlass * 0.45, 9, Math.max(1.5, w * 0.005), 0.5)}
            {glassContents()}
            {/* glass highlight: a soft diagonal streak */}
            <linearGradient id={`${id}h`} gradientUnits="userSpaceOnUse" x1={pcx - rGlass * 0.55} y1={pcy - rGlass * 0.55} x2={pcx - rGlass * 0.05} y2={pcy - rGlass * 0.05}>
              <stop offset="0" stopColor={C.fg} stopOpacity={0} />
              <stop offset="0.45" stopColor={C.fg} stopOpacity={0.08} />
              <stop offset="0.7" stopColor={C.fg} stopOpacity={0.02} />
              <stop offset="1" stopColor={C.fg} stopOpacity={0} />
            </linearGradient>
            <circle cx={pcx} cy={pcy} r={rGlass} fill={`url(#${id}h)`} />
          </g>
          {/* door handle */}
          <rect x={pcx + rOuter + w * 0.035} y={pcy - h * 0.045} width={w * 0.028} height={h * 0.09} rx={w * 0.014} fill={C.bg} />
        </g>
      )}
      {open && (
        <g>
          <ellipse cx={doorCx} cy={pcy} rx={doorRx} ry={doorRy} fill={C.surface} stroke={C.line} strokeWidth={3} />
          <ellipse cx={doorCx} cy={pcy} rx={doorRx * 0.74} ry={doorRy * 0.8} fill={C.surface2} stroke={C.line} strokeWidth={2} />
          <path d={`M${doorCx - doorRx * 0.4} ${pcy - doorRy * 0.45} L ${doorCx - doorRx * 0.05} ${pcy - doorRy * 0.62}`} stroke={C.fg} strokeOpacity={0.08} strokeWidth={Math.max(4, w * 0.03)} strokeLinecap="round" />
          {/* hinge */}
          <rect x={pcx - rOuter - 6} y={pcy - doorRy * 0.35} width={10} height={doorRy * 0.7} rx={4} fill={C.line} />
        </g>
      )}
    </g>
  );
};

export const WashingMachine: React.FC<CustomElementProps> = ({ e, t, fps }) => {
  if (t < 0) return null;
  return <Machine x={e.x} y={e.y} h={e.h ?? 380} door={e.door} drum={e.drum} contents={e.contents} display={e.display} light={e.light} color={e.color} age={e.age} t={t} fps={fps} />;
};
