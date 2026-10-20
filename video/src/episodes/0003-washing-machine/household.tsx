// Advisory 0003: set dressing drawn outline-on-surface (no glow): the washing pile, the
// basket of odd socks, the bins and the chest of drawers. Spec: assets-spec.md.
import React from "react";
import { C } from "../../theme";
import { clamp01, easeInOut, prog, rand } from "../../anim";
import type { CustomElementProps } from "../../episode-context";
import { SockShape, sockBox, type SockPattern } from "./sock";

const S = { stroke: C.line, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const PATTERNS: SockPattern[] = ["stripe", "dots", "heel", "plain"];

// A small sock of yours at (x, y) = its centre.
const SmallSock: React.FC<{ x: number; y: number; size: number; rot: number; pattern: SockPattern; color: string; state?: "flat" | "hang"; glow?: boolean }> = ({ x, y, size, rot, pattern, color, state = "flat", glow }) => {
  const b = sockBox(state, size, "yours");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) translate(${-b.cx} ${-b.cy})`} filter={glow ? "url(#glowSoft)" : undefined}>
      <SockShape state={state} size={size} kind="yours" pattern={pattern} color={color} />
    </g>
  );
};

// ---------------------------------------------------------------- sock-pile
export const SockPile: React.FC<CustomElementProps> = ({ e, t }) => {
  if (t < 0) return null;
  const w = e.w ?? 320, n = e.socks ?? 3;
  const x = e.x, y = e.y, H = 0.22 * w;
  const seed = Math.round(x * 0.37 + w);
  // Soft lumps (towels, a shirt), back to front.
  const lumps = [
    { cx: -0.22, w: 0.46, h: 0.72 },
    { cx: 0.18, w: 0.5, h: 0.92 },
    { cx: -0.02, w: 0.42, h: 0.6 },
    { cx: 0.36, w: 0.3, h: 0.5 },
    { cx: -0.38, w: 0.26, h: 0.42 },
  ];
  const lump = (cx: number, lw: number, lh: number, k: number) => {
    const l = x + (cx - lw / 2) * w, r = x + (cx + lw / 2) * w, top = y - lh * H;
    const m = x + cx * w + (rand(seed + k) - 0.5) * lw * w * 0.3;
    return `M${l} ${y} C ${l} ${top + lh * H * 0.35} ${m - lw * w * 0.35} ${top} ${m} ${top} C ${m + lw * w * 0.35} ${top} ${r} ${top + lh * H * 0.4} ${r} ${y} Z`;
  };
  const socks = Array.from({ length: n }, (_, i) => {
    const f = n === 1 ? 0.5 : i / (n - 1);
    const sx = x + (-0.36 + f * 0.72) * w + (rand(seed + i * 3) - 0.5) * 30;
    const sy = y - H * (0.55 + rand(seed + i * 5) * 0.35);
    const rot = -40 + rand(seed + i * 7) * 80;
    return { sx, sy, rot, size: w * (0.24 + rand(seed + i) * 0.06), pattern: PATTERNS[(i + seed) % 4] };
  });
  return (
    <g>
      {/* socks half tucked in: drawn behind the front lumps */}
      {socks.slice(0, Math.ceil(n / 2)).map((s, i) => (
        <SmallSock key={`b${i}`} x={s.sx} y={s.sy} size={s.size} rot={s.rot} pattern={s.pattern} color={C.dim} />
      ))}
      {lumps.slice(0, 3).map((L, i) => (
        <path key={i} d={lump(L.cx, L.w, L.h, i)} fill={C.surface2} {...S} strokeWidth={2} />
      ))}
      {/* a T-shirt sleeve poking out of the pile */}
      <g transform={`rotate(-24 ${x + 0.16 * w} ${y - H * 0.4})`}>
        <path d={`M${x + 0.06 * w} ${y - H * 0.28} L ${x + 0.25 * w} ${y - H * 0.5} L ${x + 0.3 * w} ${y - H * 0.18} L ${x + 0.13 * w} ${y - H * 0.06} Z`} fill={C.surface2} {...S} strokeWidth={2} />
        <path d={`M${x + 0.235 * w} ${y - H * 0.46} L ${x + 0.28 * w} ${y - H * 0.2}`} stroke={C.line} strokeWidth={2} />
      </g>
      {socks.slice(Math.ceil(n / 2)).map((s, i) => (
        <SmallSock key={`f${i}`} x={s.sx} y={s.sy} size={s.size} rot={s.rot} pattern={s.pattern} color={C.dim} />
      ))}
      {lumps.slice(3).map((L, i) => (
        <path key={i} d={lump(L.cx, L.w, L.h, i + 3)} fill={C.surface2} {...S} strokeWidth={2} />
      ))}
      {/* fold lines */}
      <path d={`M${x - 0.3 * w} ${y - H * 0.35} q ${0.08 * w} ${-H * 0.12} ${0.16 * w} ${-H * 0.02}`} stroke={C.line} strokeWidth={2} fill="none" opacity={0.7} />
    </g>
  );
};

// ---------------------------------------------------------------- sock-basket
export const SockBasket: React.FC<CustomElementProps> = ({ e, t }) => {
  if (t < 0) return null;
  const w = e.w ?? 420, n = e.count ?? 12;
  const x = e.x, y = e.y, h = 0.5 * w;
  const topW = w, botW = w * 0.78;
  const rimY = y - h;
  const seed = Math.round(x * 0.11 + w * 0.3);
  const basket = `M${x - topW / 2} ${rimY} L ${x + topW / 2} ${rimY} L ${x + botW / 2} ${y} L ${x - botW / 2} ${y} Z`;
  // The heap: socks inside (behind the front), a few hanging over the rim (in front).
  const socks = Array.from({ length: n }, (_, i) => {
    const row = i % 3;
    const f = ((i * 0.618) % 1) * 0.9 + 0.05;
    const over = i % 4 === 3; // hangs over the edge
    const size = w * (0.26 + rand(seed + i * 2.3) * 0.08);
    const sx = x + (f - 0.5) * topW * (over ? 1.02 : 0.82);
    const sy = rimY - (over ? -size * 0.22 : 4 + row * (h * 0.09) + rand(seed + i) * h * 0.06);
    const rot = over ? (sx < x ? -72 : 72) + (rand(seed + i * 9) - 0.5) * 16 : -35 + rand(seed + i * 4.1) * 70;
    const color = i % 3 === 1 ? C.dim : C.fg;
    return { sx, sy, size, rot, over, color, pattern: PATTERNS[(i * 3 + (i >> 2)) % 4] };
  });
  const weave: React.ReactNode[] = [];
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const yy = rimY + h * 0.14 + (r * (h * 0.78)) / rows;
    const fw = topW + ((botW - topW) * (yy - rimY)) / h;
    const cols = 9;
    for (let c = 0; c < cols; c++) {
      const xx = x - fw / 2 + fw * ((c + (r % 2) * 0.5 + 0.25) / cols);
      if (xx > x + fw / 2 - 12) continue;
      weave.push(<path key={`${r}-${c}`} d={`M${xx} ${yy} h ${fw / cols * 0.5}`} stroke={C.line} strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />);
    }
  }
  return (
    <g>
      {socks.filter((s) => !s.over).map((s, i) => (
        <SmallSock key={`in${i}`} x={s.sx} y={s.sy} size={s.size} rot={s.rot} pattern={s.pattern} color={s.color} glow={s.color === C.fg} />
      ))}
      <path d={basket} fill={C.surface} {...S} strokeWidth={3} />
      {weave}
      {/* rim band and handle slots */}
      <path d={`M${x - topW / 2 - 6} ${rimY} H ${x + topW / 2 + 6}`} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
      {[-1, 1].map((k) => (
        <rect key={k} x={x + k * topW * 0.36 - topW * 0.06} y={rimY + h * 0.08} width={topW * 0.12} height={h * 0.07} rx={h * 0.035} fill={C.bg} stroke={C.line} strokeWidth={2.5} />
      ))}
      {socks.filter((s) => s.over).map((s, i) => (
        <SmallSock key={`ov${i}`} x={s.sx} y={s.sy} size={s.size} rot={s.rot} pattern={s.pattern} color={s.color} glow={s.color === C.fg} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- bin
export const Bin: React.FC<CustomElementProps> = ({ e, t }) => {
  if (t < 0) return null;
  const { x, y } = e;
  const h = e.h ?? 300;
  const kind = e.kind ?? "pedal";
  const ghost = !!e.ghost;
  const st = ghost
    ? { fill: "none", stroke: C.dim, strokeWidth: 3, strokeDasharray: "10 9", strokeLinejoin: "round" as const }
    : { fill: C.surface, stroke: C.line, strokeWidth: 3, strokeLinejoin: "round" as const };
  if (kind === "wheelie") {
    const w = 0.62 * h;
    const top = y - h * 0.9; // under the lid
    const lidTop = y - h;
    const bw = w * 0.9;
    const body = `M${x - w / 2} ${top} L ${x + w / 2} ${top} L ${x + bw / 2} ${y - 4} L ${x - bw / 2} ${y - 4} Z`;
    if (ghost) {
      return (
        <g>
          <path d={body} {...st} />
          <path d={`M${x - w / 2 - 10} ${top} L ${x + w / 2 + 10} ${top} L ${x + w / 2 + 6} ${lidTop} L ${x - w / 2 - 2} ${lidTop} Z`} {...st} />
          <ellipse cx={x} cy={y + 4} rx={w * 0.6} ry={10} fill={C.dim} opacity={0.12} />
        </g>
      );
    }
    return (
      <g>
        {/* handle bar at the back */}
        <rect x={x + w / 2 - 4} y={lidTop - h * 0.04} width={w * 0.14} height={h * 0.06} rx={6} fill={C.surface2} stroke={C.line} strokeWidth={3} />
        <path d={body} {...st} />
        {/* front ridges */}
        {[0.3, 0.55].map((f) => (
          <path key={f} d={`M${x - w * 0.36} ${top + (y - top) * f} H ${x + w * 0.36}`} stroke={C.line} strokeWidth={2.5} opacity={0.7} />
        ))}
        <rect x={x - w * 0.2} y={top + h * 0.1} width={w * 0.4} height={h * 0.05} rx={4} fill="none" stroke={C.line} strokeWidth={2.5} />
        {/* lid overhanging the front */}
        <path d={`M${x - w / 2 - 14} ${top + 6} L ${x + w / 2 + 6} ${top + 6} L ${x + w / 2 + 2} ${lidTop} L ${x - w / 2 - 4} ${lidTop} Z`} fill={C.surface2} stroke={C.line} strokeWidth={3} strokeLinejoin="round" />
        {/* wheel at the bottom back */}
        <circle cx={x + bw / 2 - h * 0.06} cy={y - h * 0.07} r={h * 0.07} fill={C.surface2} stroke={C.line} strokeWidth={3} />
        <circle cx={x + bw / 2 - h * 0.06} cy={y - h * 0.07} r={h * 0.02} fill={C.line} />
      </g>
    );
  }
  // Pedal bin: a cylinder in side view with a domed lid and a foot pedal.
  const w = 0.6 * h;
  const rim = y - h * 0.93;
  const l = x - w / 2, r = x + w / 2;
  const dome = h * 0.07;
  const open = e.lid === "open";
  const lidPath = `M${l - 2} ${rim} Q ${l} ${rim - dome * 1.6} ${x} ${rim - dome * 1.5} Q ${r} ${rim - dome * 1.6} ${r + 2} ${rim} Z`;
  return (
    <g>
      {open && (
        // Lid tilted back 70° on its hinge (back = right edge), showing the dark opening.
        <g transform={`rotate(70 ${r} ${rim})`}>
          <path d={lidPath} {...st} fill={C.surface2} />
        </g>
      )}
      <path d={`M${l} ${rim} L ${l + 6} ${y - 6} Q ${l + 8} ${y} ${l + 16} ${y} L ${r - 16} ${y} Q ${r - 8} ${y} ${r - 6} ${y - 6} L ${r} ${rim} Z`} {...st} />
      {!ghost && <path d={`M${l + 10} ${rim + h * 0.08} H ${r - 10}`} stroke={C.line} strokeWidth={2.5} opacity={0.7} />}
      {open ? (
        <ellipse cx={x} cy={rim} rx={w / 2 - 1} ry={h * 0.035} fill={C.bg} stroke={C.line} strokeWidth={3} />
      ) : (
        <path d={lidPath} {...st} fill={ghost ? "none" : C.surface2} />
      )}
      {!ghost && <path d={`M${x - w * 0.18} ${y - 4} L ${x - w * 0.24} ${y + 6} L ${x + w * 0.1} ${y + 6} L ${x + w * 0.06} ${y - 4} Z`} fill={C.surface2} stroke={C.line} strokeWidth={2.5} strokeLinejoin="round" />}
    </g>
  );
};

// ---------------------------------------------------------------- drawers
export const Drawers: React.FC<CustomElementProps> = ({ e, t, fps }) => {
  // `delay` here only delays the opening sequence: the chest itself is always there.
  const h = e.h ?? 420;
  const rows = e.rows ?? 4;
  const w = rows === 2 ? 1.2 * h : 0.9 * h;
  const { x, y } = e;
  const l = x - w / 2, top = y - h;
  const legH = h * 0.05;
  const inset = h * 0.04;
  const slotH = (h - legH - inset * 2 - (rows - 1) * h * 0.02) / rows;
  const openAmt = (i: number) => {
    if (Array.isArray(e.open)) return e.open.includes(i) ? 1 : 0;
    if (e.open === "sequence") {
      const start = i * 0.35 * fps;
      return prog(t, start, start + 8, easeInOut);
    }
    return 0;
  };
  const sockRow = typeof e.sock === "number" ? e.sock : null;
  return (
    <g>
      <rect x={l} y={top} width={w} height={h - legH} rx={6} fill={C.surface} stroke={C.line} strokeWidth={3} />
      {[l + w * 0.06, l + w * 0.94 - 12].map((lx, i) => (
        <rect key={i} x={lx} y={y - legH} width={12} height={legH} fill={C.surface2} stroke={C.line} strokeWidth={2.5} />
      ))}
      {/* bottom drawer first, so an open drawer's front overlaps the one below it */}
      {Array.from({ length: rows }, (_, k) => rows - 1 - k).map((i) => {
        const sy = top + inset + i * (slotH + h * 0.02);
        const sx = l + inset, sw = w - inset * 2;
        const o = clamp01(openAmt(i));
        // An open drawer: the front comes forward (drawn shifted down-right) and the dark
        // inside of the drawer shows above it, between its two side walls.
        const dx = 10 * o, dy = Math.max(10, 0.06 * h) * o;
        const fx = sx + dx, fy = sy + dy;
        return (
          <g key={i}>
            {o > 0 && (
              <g>
                <rect x={sx} y={sy} width={sw} height={slotH} fill={C.bg} />
                <path d={`M${sx + 3} ${sy + 2} L ${fx + 3} ${fy} M${sx + sw - 3} ${sy + 2} L ${fx + sw - 3} ${fy}`} stroke={C.line} strokeWidth={2.5} />
                <path d={`M${fx + 8} ${fy - Math.min(dy, 10) * 0.8} H ${fx + sw - 8}`} stroke={C.surface2} strokeWidth={3} opacity={0.9} />
              </g>
            )}
            {sockRow === i && (
              // The grey sock's cuff, poking out over the drawer's top edge.
              <g filter="url(#glow)" transform={`translate(${fx + sw * 0.62} ${fy + 4})`}>
                <path d={`M${-sw * 0.09} 0 L ${-sw * 0.07} ${-slotH * 0.55} Q ${0} ${-slotH * 0.68} ${sw * 0.08} ${-slotH * 0.52} L ${sw * 0.09} 0 Z`} fill={C.grey} />
                {[-0.045, -0.015, 0.015, 0.045].map((f) => (
                  <path key={f} d={`M${sw * f} ${-slotH * 0.5} L ${sw * f * 1.1} ${-slotH * 0.12}`} stroke={C.bg} strokeOpacity={0.5} strokeWidth={2} />
                ))}
              </g>
            )}
            <rect x={fx} y={fy} width={sw} height={slotH} rx={4} fill={C.surface2} stroke={C.line} strokeWidth={2.5} />
            <circle cx={fx + sw / 2} cy={fy + slotH / 2} r={Math.max(5, h * 0.016)} fill={C.dim} />
          </g>
        );
      })}
    </g>
  );
};
