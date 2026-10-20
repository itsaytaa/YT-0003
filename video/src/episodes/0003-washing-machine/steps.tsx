// Advisory 0003: footprints of someone who is never shown. Every second print is bare
// and makes a sound (red arcs); sock prints are silent. Spec: assets-spec.md → `steps`.
import React from "react";
import { C } from "../../theme";
import { clamp01, ease } from "../../anim";
import type { CustomElementProps } from "../../episode-context";

const STEP = 110; // px per step at scale 1

// One print, seen from a low side angle (flattened), toe pointing in `dir`.
const Print: React.FC<{ x: number; y: number; k: number; bare: boolean; dir: number; opacity: number }> = ({ x, y, k, bare, dir, opacity }) => {
  const w = 36 * k, h = 8 * k;
  if (!bare) {
    return <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill={C.line} opacity={0.6 * opacity} />;
  }
  // Bare: firmer, with a narrower heel.
  const hx = x - (dir * w) / 2, tx = x + (dir * w) / 2;
  const d = [
    `M${hx} ${y}`,
    `C${hx} ${y - h * 0.32} ${x - dir * w * 0.2} ${y - h * 0.38} ${x} ${y - h * 0.46}`,
    `C${x + dir * w * 0.3} ${y - h * 0.56} ${tx} ${y - h * 0.5} ${tx} ${y}`,
    `C${tx} ${y + h * 0.5} ${x + dir * w * 0.3} ${y + h * 0.56} ${x} ${y + h * 0.46}`,
    `C${x - dir * w * 0.2} ${y + h * 0.38} ${hx} ${y + h * 0.32} ${hx} ${y}`,
    "Z",
  ].join(" ");
  return <path d={d} fill={C.dim} opacity={0.8 * opacity} />;
};

// Two or three concentric arcs that expand and fade over 18 frames.
const Arcs: React.FC<{ x: number; y: number; k: number; age: number; color: string }> = ({ x, y, k, age, color }) => {
  if (age < 0 || age > 18) return null;
  const p = age / 18;
  return (
    <g fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" filter={color === C.red ? "url(#glowRed)" : undefined}>
      {[0, 1, 2].map((i) => {
        const pp = clamp01(p * 1.15 - i * 0.12);
        if (pp <= 0) return null;
        const r = (14 + (60 - 14) * ease(pp)) * k;
        const op = (1 - pp) * (i === 2 ? 0.6 : 1);
        // upper arc, open toward the floor
        return <path key={i} d={`M${x - r} ${y - 2 * k} A ${r} ${r * 0.75} 0 0 1 ${x + r} ${y - 2 * k}`} opacity={op} />;
      })}
    </g>
  );
};

export const Steps: React.FC<CustomElementProps> = ({ e, t, dur }) => {
  if (t < 0) return null;
  const k = e.scale ?? 1;
  const from = e.fromX, to = e.toX ?? e.fromX;
  const dir = to >= from ? 1 : -1;
  const n = Math.max(1, Math.floor(Math.abs(to - from) / (STEP * k) + 1e-6) + 1);
  const pattern = e.pattern ?? "alternate";
  const seq = e.draw === "sequence";
  const span = dur * 0.75;
  const arcColor = e.sound === "red" ? C.red : e.sound === "dim" ? C.dim : null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = from + dir * i * STEP * k;
        const yy = e.y + (i % 2 === 0 ? -5 : 5) * k;
        const bare = pattern === "bare" || (pattern === "alternate" && i % 2 === 1);
        // Appearance frame of print i (spread over the first 75% of the line).
        const at = seq ? (n === 1 ? 6 : (i / (n - 1)) * Math.max(0, span - 4)) : -Infinity; // a single print lands just after the cut
        const op = seq ? clamp01((t - at) / 4) : 1;
        if (op <= 0) return null;
        return (
          <g key={i}>
            <Print x={x} y={yy} k={k} bare={bare} dir={dir} opacity={op} />
            {bare && arcColor && seq && <Arcs x={x} y={yy} k={k} age={t - at} color={arcColor} />}
          </g>
        );
      })}
    </g>
  );
};
