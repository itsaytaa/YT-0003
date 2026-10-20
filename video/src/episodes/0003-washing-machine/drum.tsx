// Advisory 0003: the `drum-view` shot, a full-frame close-up through the door glass,
// including the gap between the door seal and the drum where socks go.
// Spec: assets-spec.md → "Shot type: drum-view".
import React from "react";
import { C, FONT } from "../../theme";
import { clamp01, ease, easeInOut, lerp, prog, rand } from "../../anim";
import type { CustomShotProps } from "../../episode-context";
import { SockShape, sockBox, type SockKind, type SockPattern } from "./sock";
import { tumble } from "./machine";

const CX = 960, CY = 470;
const R_DOOR = 360, R_GLASS = 300, SEAL = 26;
const R_SEAL_IN = R_GLASS - SEAL; // 274
const R_BACK = 190; // the drum's back wall
const SOCK = 190;

// The gap: a dark crescent at about 7–8 o'clock, ~120 px long, 18 px at its widest.
const GAP_MID = 136; // degrees, screen (90 = down, 180 = left)
const GAP_SPAN = (120 / R_SEAL_IN) * (180 / Math.PI);
const rad = (d: number) => (d * Math.PI) / 180;
const polar = (deg: number, r: number) => ({ x: CX + Math.cos(rad(deg)) * r, y: CY + Math.sin(rad(deg)) * r });

function gapPath(width: number) {
  const a1 = GAP_MID - GAP_SPAN / 2, a2 = GAP_MID + GAP_SPAN / 2;
  const n = 18;
  const outer = Array.from({ length: n + 1 }, (_, i) => polar(lerp(a1, a2, i / n), R_SEAL_IN + 2));
  const inner = Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n;
    return polar(lerp(a2, a1, f), R_SEAL_IN + 2 - width * Math.sin(Math.PI * (1 - f)));
  });
  return `M${outer.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} L ${inner.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} Z`;
}

type Content = { kind: SockKind; pattern?: SockPattern };

// Sorted layout: yours stacked on the left half, theirs on the right half.
function sortedTargets(contents: Content[]) {
  let yi = 0, ti = 0;
  const ny = contents.filter((c) => c.kind !== "theirs").length;
  const nt = contents.length - ny;
  return contents.map((c, i) => {
    const theirs = c.kind === "theirs";
    const k = theirs ? ti++ : yi++;
    const n = theirs ? nt : ny;
    const baseY = 600 - (n - 1 - k) * 52;
    return { x: (theirs ? 1088 : 836) + (rand(i * 7.1) - 0.5) * 18, y: baseY, rot: (rand(i * 3.3) - 0.5) * 10 };
  });
}

// Integral of a speed curve that eases from 1 to 0 between frames a and b.
function slowedPhase(t: number, a: number, b: number) {
  if (t <= a) return t;
  const T = Math.min(t, b);
  let s = a;
  const step = 0.5;
  for (let f = a; f < T; f += step) s += (1 - easeInOut(clamp01((f + step / 2 - a) / (b - a)))) * Math.min(step, T - f);
  return s;
}

export const DrumView: React.FC<CustomShotProps> = ({ shot, frame, dur, fps }) => {
  const d = shot.drum ?? {};
  const contents: Content[] = d.contents ?? [];
  const mode: string | undefined = d.mode;
  const turnsPerSec = d.spin === "fast" ? 1 : 1 / 3;
  const t = frame;

  // Drum/tumble clock in frames. `sort` slows to a stop; `sorted` stands still. Both are
  // measured from the end of the slow-down so the two shots line up exactly.
  const stopA = dur * 0.05, stopB = dur * 0.55;
  let clock = t;
  if (mode === "sort") clock = slowedPhase(t, stopA, stopB) - slowedPhase(dur, stopA, stopB);
  if (mode === "sorted") clock = 0;
  const ang = (clock / fps) * 360 * turnsPerSec;

  const targets = sortedTargets(contents);
  const sortW = mode === "sort" ? prog(t, dur * 0.22, dur * 0.68, easeInOut) : mode === "sorted" ? 1 : 0;
  const lineStart = dur * 0.7;
  const lineP = mode === "sort" ? prog(t, lineStart, lineStart + fps * 0.5, (x) => x) : mode === "sorted" ? 1 : 0;

  // The sock that goes through the gap.
  const thr = d.through;
  const thrIdx = thr ? contents.findIndex((c) => c.kind === thr.kind && (thr.kind === "theirs" || (c.pattern ?? "plain") === (thr.pattern ?? "plain"))) : -1;
  const thrStart = thr ? (thr.at ?? 0.3) * dur : 0;
  const thrP = thr ? prog(t, thrStart, thrStart + fps * 0.8, (x) => x) : 0;
  const gapW = thr ? lerp(18, 13, prog(t, thrStart + fps * 0.6, thrStart + fps * 1.1, ease)) : 18;

  const n = Math.max(1, contents.length);
  const sockAt = (i: number, tt: number) => {
    const u = ((((tt / fps) * turnsPerSec * 0.6 + i / n + rand(i * 3.7 + 1) * 0.06) % 1) + 1) % 1;
    const p = tumble(u, i * 5 + 2);
    return { x: CX + p.x * R_SEAL_IN * 0.8, y: CY + p.y * R_SEAL_IN * 0.8, rot: p.spin };
  };

  const socks = contents.map((c, i) => {
    let { x, y, rot } = sockAt(i, clock);
    if (sortW > 0) {
      const tg = targets[i];
      // shortest way round for the rotation
      const r0 = ((rot % 360) + 540) % 360 - 180;
      x = lerp(x, tg.x, sortW);
      y = lerp(y, tg.y, sortW);
      rot = lerp(r0, tg.rot, sortW);
    }
    let sx = 1, sy = 1, op = 1;
    if (i === thrIdx && thrP > 0) {
      // slide along the seal into the gap, getting thinner, and gone
      const s = sockAt(i, thrStart);
      const g = polar(GAP_MID, R_SEAL_IN - 6);
      const pe = thrP * thrP;
      x = lerp(s.x, g.x, pe);
      y = lerp(s.y, g.y, pe);
      const tangent = GAP_MID + 90;
      const r0 = ((s.rot % 360) + 540) % 360 - 180;
      rot = lerp(r0, tangent - 360 * Math.round((tangent - r0) / 360), ease(thrP));
      sx = lerp(1, 0.35, ease(thrP));
      sy = lerp(1, 0.12, ease(thrP));
      op = 1 - prog(thrP, 0.7, 1, (v) => v);
    }
    if (i === thrIdx && thrP >= 1) return null;
    const b = sockBox("flat", SOCK, c.kind);
    return (
      <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sx} ${sy}) translate(${-b.cx} ${-b.cy})`} opacity={op} filter="url(#glowSoft)">
        <SockShape size={SOCK} kind={c.kind} pattern={c.pattern ?? "plain"} />
      </g>
    );
  });

  const dots = (r: number, n: number, size: number, offset = 0) =>
    Array.from({ length: n }, (_, i) => {
      const p = polar(ang + offset + (i * 360) / n, r);
      return <circle key={i} cx={p.x} cy={p.y} r={size} fill={C.line} />;
    });

  const baffles = [0, 120, 240].map((a) => {
    const deg = ang + a + 30;
    return (
      <g key={a} transform={`rotate(${deg} ${CX} ${CY})`}>
        <rect x={CX + R_BACK + 8} y={CY - 17} width={R_SEAL_IN - R_BACK - 4} height={34} rx={17} fill={C.surface2} stroke={C.line} strokeWidth={2} />
      </g>
    );
  });

  const dark = d.dark ? 0.4 * prog(t, 0, 14, (x) => x) : 0;
  const gapOutline = d.gap ? 0.65 + 0.35 * Math.sin(Math.PI * clamp01(t / (fps * 0.7))) : 0;
  const labelP = d.labels ? prog(t, fps * 0.3, fps * 1.3, (x) => x) : 0;

  return (
    <g>
      <defs>
        <clipPath id="dv-glass">
          <circle cx={CX} cy={CY} r={R_GLASS} />
        </clipPath>
        <clipPath id="dv-drum">
          <circle cx={CX} cy={CY} r={R_SEAL_IN} />
        </clipPath>
        <linearGradient id="dv-streak" gradientUnits="userSpaceOnUse" x1={CX - 190} y1={CY - 190} x2={CX + 10} y2={CY + 10}>
          <stop offset="0" stopColor={C.fg} stopOpacity={0} />
          <stop offset="0.45" stopColor={C.fg} stopOpacity={0.06} />
          <stop offset="0.7" stopColor={C.fg} stopOpacity={0.015} />
          <stop offset="1" stopColor={C.fg} stopOpacity={0} />
        </linearGradient>
        <radialGradient id="dv-depth" cx={CX} cy={CY} r={R_SEAL_IN} gradientUnits="userSpaceOnUse">
          <stop offset="0.6" stopColor={C.bg} stopOpacity={0} />
          <stop offset="1" stopColor={C.bg} stopOpacity={0.55} />
        </radialGradient>
      </defs>
      {/* door rim */}
      <circle cx={CX} cy={CY} r={R_DOOR} fill={C.surface2} stroke={C.line} strokeWidth={3} />
      <circle cx={CX} cy={CY} r={R_DOOR - 22} fill="none" stroke={C.line} strokeWidth={2} opacity={0.6} />
      <circle cx={CX} cy={CY} r={R_GLASS + 4} fill="none" stroke={C.line} strokeWidth={3} />
      <g clipPath="url(#dv-glass)">
        {/* the drum: cylinder wall, back wall with perforations, baffles */}
        <circle cx={CX} cy={CY} r={R_GLASS} fill={C.surface} />
        {dots(232, 28, 4.2, 6)}
        <circle cx={CX} cy={CY} r={R_BACK} fill={C.bg} stroke={C.line} strokeWidth={2} />
        {dots(160, 24, 4.5)}
        {dots(112, 16, 4, 11)}
        <circle cx={CX} cy={CY} r={44} fill="none" stroke={C.surface2} strokeWidth={6} />
        {baffles}
        <rect x={CX - R_GLASS} y={CY - R_GLASS} width={R_GLASS * 2} height={R_GLASS * 2} fill="url(#dv-depth)" />
        <g clipPath="url(#dv-drum)">{socks}</g>
        {/* door seal and the gap */}
        <circle cx={CX} cy={CY} r={R_SEAL_IN + SEAL / 2} fill="none" stroke={C.surface2} strokeWidth={SEAL} />
        <circle cx={CX} cy={CY} r={R_SEAL_IN} fill="none" stroke={C.line} strokeWidth={2} />
        <path d={gapPath(gapW)} fill={C.bg} />
        {/* glass */}
        <circle cx={CX} cy={CY} r={R_GLASS} fill={C.surface} opacity={0.18} />
        <circle cx={CX} cy={CY} r={R_GLASS} fill="url(#dv-streak)" />
        <path d={`M${polar(205, R_GLASS - 24).x} ${polar(205, R_GLASS - 24).y} A ${R_GLASS - 24} ${R_GLASS - 24} 0 0 1 ${polar(245, R_GLASS - 24).x} ${polar(245, R_GLASS - 24).y}`} fill="none" stroke={C.fg} strokeOpacity={0.07} strokeWidth={10} strokeLinecap="round" />
        {dark > 0 && <circle cx={CX} cy={CY} r={R_GLASS} fill={C.bg} opacity={dark} />}
        {/* sort divider */}
        {lineP > 0 && (
          // rects, not a path: a zero-width path loses its filter region
          <g>
            <rect x={CX - 6} y={CY - R_GLASS} width={12} height={R_GLASS * 2 * lineP} fill={C.blue} opacity={0.18} />
            <rect x={CX - 1.5} y={CY - R_GLASS} width={3} height={R_GLASS * 2 * lineP} fill={C.blue} />
          </g>
        )}
      </g>
      {gapOutline > 0 && (
        <path d={gapPath(gapW + 6)} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="9 7" strokeLinejoin="round" opacity={gapOutline} filter="url(#glowBlue)" transform={`translate(${CX} ${CY}) scale(1.06) translate(${-CX} ${-CY})`} />
      )}
      {labelP > 0 && (
        <g>
          {[
            { x: 836, text: "YOURS" },
            { x: 1088, text: "THEIRS" },
          ].map((l, i) => {
            const p = clamp01(labelP * 1.25 - i * 0.25);
            const chars = Math.round(l.text.length * clamp01((p - 0.35) / 0.65));
            return (
              <g key={l.text}>
                <path d={`M${l.x} 630 L ${l.x} ${630 + 24 * clamp01(p / 0.35)}`} stroke={C.dim} strokeWidth={2} />
                <text x={l.x} y={686} textAnchor="middle" fontFamily={FONT.mono} fontWeight={500} fontSize={24} letterSpacing="0.22em" fill={C.dim}>
                  {l.text.slice(0, chars)}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
