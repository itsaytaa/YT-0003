// Advisory 0003: the sock. One drawing (SockShape) used by the `sock` element, the pile,
// the basket, the drum and the inspector's feet, so every sock in the episode is the
// same family. Spec: advisories/0003-washing-machine/assets-spec.md → `sock`.
import React, { useId } from "react";
import { C } from "../../theme";
import { clamp01, ease, lerp, popIn, prog } from "../../anim";
import type { CustomElementProps } from "../../episode-context";

export type SockKind = "theirs" | "yours";
export type SockPattern = "stripe" | "dots" | "heel" | "plain";
export type SockState = "flat" | "folded" | "hang" | "worn";

// SVG ids must be unique in the document (two segments overlap during a scan).
export const useSafeId = (prefix: string) => `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

// ---------------------------------------------------------------- geometry
// Every state is described in local units with u = size. Each returns the outline path,
// the bounding box and the anchor points the details need.
type Geo = { d: string; box: { x0: number; y0: number; x1: number; y1: number }; kx: number; ky: number };

// The grey wool sock is 10% longer and 10% slimmer than yours at the same `size`.
const scaleFor = (kind: SockKind) => (kind === "theirs" ? { kx: 1.1, ky: 0.9 } : { kx: 1, ky: 1 });

// Flat: lying on its side, cuff left, toe right, heel down. Origin = left end of the sole
// line (y = 0 is the floor), u = length.
function flatGeo(u: number, kind: SockKind): Geo {
  const { kx, ky } = scaleFor(kind);
  const X = (f: number) => f * u * kx;
  const Y = (f: number) => f * u * ky;
  const d = [
    `M${X(0)} ${Y(-0.3)}`,
    `L${X(0)} ${Y(-0.11)}`,
    `L${X(0.3)} ${Y(-0.06)}`,
    `C${X(0.345)} ${Y(-0.045)} ${X(0.355)} ${Y(0)} ${X(0.43)} ${Y(0)}`,
    `L${X(0.86)} ${Y(0)}`,
    `C${X(0.95)} ${Y(0)} ${X(1)} ${Y(-0.03)} ${X(1)} ${Y(-0.085)}`,
    `C${X(1)} ${Y(-0.14)} ${X(0.95)} ${Y(-0.17)} ${X(0.87)} ${Y(-0.17)}`,
    `L${X(0.55)} ${Y(-0.17)}`,
    `C${X(0.47)} ${Y(-0.17)} ${X(0.44)} ${Y(-0.2)} ${X(0.4)} ${Y(-0.235)}`,
    "Z",
  ].join(" ");
  return { d, box: { x0: 0, y0: Y(-0.3), x1: X(1), y1: 0 }, kx, ky };
}

// Worn: standing on its own in the shape of a foot. Origin = back of the heel on the
// floor, u = height.
const WORN = { W: 0.36, F: 0.66 };
function wornGeo(u: number, kind: SockKind): Geo & { W: number; F: number } {
  const { kx, ky } = scaleFor(kind);
  const W = WORN.W * u * ky; // leg width (slimmer)
  const F = WORN.F * u * kx; // foot length (longer)
  const d = [
    `M${-0.015 * u} ${-u}`,
    `L${-0.008 * u} ${-0.56 * u}`,
    `C${0.004 * u} ${-0.42 * u} ${0.022 * u} ${-0.32 * u} ${0} ${-0.2 * u}`,
    `C${0} ${-0.045 * u} ${0.035 * u} 0 ${0.15 * u} 0`,
    `L${F - 0.12 * u} 0`,
    `C${F - 0.03 * u} 0 ${F} ${-0.035 * u} ${F} ${-0.11 * u}`,
    `C${F} ${-0.19 * u} ${F - 0.06 * u} ${-0.235 * u} ${F - 0.17 * u} ${-0.25 * u}`,
    `L${W + 0.13 * u} ${-0.272 * u}`,
    `C${W + 0.03 * u} ${-0.29 * u} ${W} ${-0.33 * u} ${W} ${-0.43 * u}`,
    `Q${W + 0.028 * u} ${-0.72 * u} ${W + 0.015 * u} ${-u}`,
    "Z",
  ].join(" ");
  return { d, box: { x0: -0.015 * u, y0: -u, x1: F, y1: 0 }, kx, ky, W, F };
}

// Hang: held by the cuff (origin = centre of the cuff), hanging down, foot turned left.
function hangGeo(u: number, kind: SockKind): Geo & { W: number } {
  const { kx, ky } = scaleFor(kind);
  const W = 0.2 * u * ky;
  const L = 0.6 * u * kx; // leg length
  const F = 0.25 * u * kx; // foot reach past the front of the leg
  const fh = 0.17 * u * ky; // foot height
  const d = [
    `M${-W / 2} 0`,
    `L${W / 2} 0`,
    `L${W / 2} ${L}`,
    `C${W / 2} ${L + fh * 0.75} ${W / 2 - 0.04 * u} ${L + fh} ${W / 2 - 0.15 * u} ${L + fh}`,
    `L${-W / 2 - F + 0.08 * u} ${L + fh}`,
    `C${-W / 2 - F} ${L + fh} ${-W / 2 - F} ${L + 0.02 * u} ${-W / 2 - F + 0.08 * u} ${L + 0.01 * u}`,
    `L${-W / 2 - 0.05 * u} ${L - 0.01 * u}`,
    `C${-W / 2} ${L - 0.015 * u} ${-W / 2} ${L - 0.05 * u} ${-W / 2} ${L - 0.1 * u}`,
    "Z",
  ].join(" ");
  return { d, box: { x0: -W / 2 - F, y0: 0, x1: W / 2, y1: L + fh }, kx, ky, W };
}

// Folded in three: a flat 3:1 rectangle, origin = bottom left, u = width.
function foldedGeo(u: number): Geo {
  const h = u / 3;
  return { d: `M0 ${-h} H${u} V0 H0 Z`, box: { x0: 0, y0: -h, x1: u, y1: 0 }, kx: 1, ky: 1 };
}

export function sockGeo(state: SockState, u: number, kind: SockKind) {
  if (state === "worn") return wornGeo(u, kind);
  if (state === "hang") return hangGeo(u, kind);
  if (state === "folded") return foldedGeo(u);
  return flatGeo(u, kind);
}

// ---------------------------------------------------------------- details
const DetailLines: React.FC<{ state: SockState; u: number; kind: SockKind; pattern: SockPattern; clip: string }> = ({ state, u, kind, pattern, clip }) => {
  const g = sockGeo(state, u, kind);
  const { kx, ky } = g;
  const sw = Math.max(1.4, u * 0.0055);
  const theirs = kind === "theirs";
  const out: React.ReactNode[] = [];
  // Ribbing on the cuff (5 thin lines) and the cuff seam.
  if (state === "flat") {
    const X = (f: number) => f * u * kx, Y = (f: number) => f * u * ky;
    const cuffEnd = 0.13;
    // the leg's top and bottom edges at a given x fraction (linear between cuff and 0.3)
    const top = (f: number) => lerp(-0.3, -0.2825, f / 0.13);
    const bot = (f: number) => lerp(-0.11, -0.088, f / 0.13);
    if (theirs) {
      for (let i = 1; i <= 5; i++) {
        const k = i / 6;
        out.push(<path key={`r${i}`} d={`M${X(0.012)} ${Y(lerp(top(0), bot(0), k))} L${X(cuffEnd - 0.012)} ${Y(lerp(top(cuffEnd), bot(cuffEnd), k))}`} stroke={C.bg} strokeOpacity={0.5} strokeWidth={sw} strokeLinecap="round" />);
      }
    }
    out.push(<path key="cuff" d={`M${X(cuffEnd)} ${Y(top(cuffEnd) - 0.01)} L${X(cuffEnd + 0.006)} ${Y(bot(cuffEnd) + 0.01)}`} stroke={C.bg} strokeOpacity={theirs ? 0.55 : 0.4} strokeWidth={sw * 1.3} />);
    if (!theirs && pattern === "stripe") {
      for (const [a, b] of [[0.165, 0.2], [0.235, 0.27]]) {
        out.push(<path key={`s${a}`} d={`M${X(a)} ${Y(-0.4)} L${X(b)} ${Y(-0.4)} L${X(b + 0.03)} ${Y(0.05)} L${X(a + 0.03)} ${Y(0.05)} Z`} fill={C.bg} clipPath={`url(#${clip})`} />);
      }
    }
    if (!theirs && pattern === "heel") {
      out.push(<circle key="hc" cx={X(0.425)} cy={Y(-0.03)} r={u * 0.12} fill={C.dim} clipPath={`url(#${clip})`} />);
      out.push(<rect key="tc" x={X(0.86)} y={Y(-0.3)} width={u * 0.3} height={u * 0.4} fill={C.dim} clipPath={`url(#${clip})`} />);
    }
    if (!theirs && pattern === "dots") {
      for (let i = 0; i < 16; i++)
        for (let j = 0; j < 4; j++) {
          const cx = X(0.2 + i * 0.055 + (j % 2) * 0.027), cy = Y(-0.27 + j * 0.07);
          out.push(<circle key={`d${i}-${j}`} cx={cx} cy={cy} r={u * 0.012} fill={C.bg} clipPath={`url(#${clip})`} />);
        }
    }
  }
  if (state === "worn") {
    const { W } = g as any;
    const cuffY = -0.84 * u;
    if (theirs)
      for (let i = 1; i <= 5; i++) {
        const x = (W * i) / 6;
        out.push(<path key={`r${i}`} d={`M${x} ${-u + 0.02 * u} L${x} ${cuffY - 0.01 * u}`} stroke={C.bg} strokeOpacity={0.5} strokeWidth={sw} strokeLinecap="round" />);
      }
    out.push(<path key="cuff" d={`M${-0.02 * u} ${cuffY} L${W + 0.03 * u} ${cuffY}`} stroke={C.bg} strokeOpacity={theirs ? 0.55 : 0.4} strokeWidth={sw * 1.3} clipPath={`url(#${clip})`} />);
  }
  if (state === "hang") {
    const { W } = g as any;
    const cuffY = 0.13 * u;
    if (theirs)
      for (let i = 1; i <= 5; i++) {
        const x = -W / 2 + (W * i) / 6;
        out.push(<path key={`r${i}`} d={`M${x} ${0.012 * u} L${x} ${cuffY - 0.012 * u}`} stroke={C.bg} strokeOpacity={0.5} strokeWidth={sw} strokeLinecap="round" />);
      }
    out.push(<path key="cuff" d={`M${-W / 2 - 2} ${cuffY} L${W / 2 + 2} ${cuffY}`} stroke={C.bg} strokeOpacity={theirs ? 0.55 : 0.4} strokeWidth={sw * 1.3} clipPath={`url(#${clip})`} />);
    if (!theirs && pattern === "stripe")
      for (const a of [0.17, 0.25]) out.push(<rect key={`s${a}`} x={-W} y={a * u} width={W * 2} height={0.035 * u} fill={C.bg} clipPath={`url(#${clip})`} />);
    if (!theirs && pattern === "dots")
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 12; j++)
          out.push(<circle key={`d${i}-${j}`} cx={-W / 2 - 0.25 * u + (i + 0.5 + (j % 2) * 0.5) * W * 0.5} cy={0.19 * u + j * 0.055 * u} r={u * 0.013} fill={C.bg} clipPath={`url(#${clip})`} />);
    if (!theirs && pattern === "heel") {
      out.push(<circle key="hc" cx={W / 2} cy={0.74 * u} r={u * 0.12} fill={C.dim} clipPath={`url(#${clip})`} />);
      out.push(<rect key="tc" x={-W / 2 - u} y={0} width={u * 0.88} height={u} fill={C.dim} clipPath={`url(#${clip})`} />);
    }
  }
  if (state === "folded") {
    const h = u / 3;
    for (const f of [1 / 3, 2 / 3]) out.push(<path key={`f${f}`} d={`M${u * f} ${-h} V0`} stroke={C.bg} strokeWidth={Math.max(2, u * 0.008)} />);
    if (theirs)
      for (let i = 1; i <= 5; i++) {
        const y = -h + (h * i) / 6;
        out.push(<path key={`r${i}`} d={`M${u * 0.03} ${y} H${u / 3 - u * 0.03}`} stroke={C.bg} strokeOpacity={0.5} strokeWidth={sw} strokeLinecap="round" />);
      }
  }
  // Wool texture: a few short strokes, barely there.
  if (theirs) {
    const b = g.box;
    const n = state === "folded" ? 8 : 7;
    for (let i = 0; i < n; i++) {
      const fx = 0.22 + ((i * 0.618) % 1) * 0.7, fy = 0.25 + ((i * 0.382 + 0.17) % 1) * 0.55;
      const cx = lerp(b.x0, b.x1, state === "worn" || state === "hang" ? 0.15 + ((i * 0.618) % 1) * 0.7 : fx);
      const cy = lerp(b.y0, b.y1, state === "worn" ? 0.3 + ((i * 0.382) % 1) * 0.6 : fy);
      const l = u * 0.017;
      out.push(<path key={`w${i}`} d={`M${cx - l} ${cy - l * 0.4} L${cx} ${cy + l * 0.4} L${cx + l} ${cy - l * 0.4}`} stroke={C.bg} strokeOpacity={0.15} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${clip})`} />);
    }
  }
  return <g>{out}</g>;
};

// The sock drawing at the local origin of its state (see the *Geo functions).
export const SockShape: React.FC<{ state?: SockState; size: number; kind?: SockKind; pattern?: SockPattern; color?: string; ghost?: boolean; detail?: boolean }> = ({ state = "flat", size, kind = "yours", pattern = "plain", color, ghost, detail = true }) => {
  const clip = useSafeId("sk");
  const g = sockGeo(state, size, kind);
  if (ghost) return <path d={g.d} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray="8 8" strokeLinejoin="round" />;
  const fill = color ?? (kind === "theirs" ? C.grey : C.fg);
  return (
    <g>
      <clipPath id={clip}>
        <path d={g.d} />
      </clipPath>
      <path d={g.d} fill={fill} strokeLinejoin="round" />
      {detail && <DetailLines state={state} u={size} kind={kind} pattern={pattern} clip={clip} />}
    </g>
  );
};

// Centre of a state's bounding box, so callers can rotate around it.
export function sockBox(state: SockState, size: number, kind: SockKind) {
  const b = sockGeo(state, size, kind).box;
  return { ...b, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 };
}

// Places a sock so that (x, y) means what the spec says: horizontal centre, and the
// resting surface (lowest point after rotation) for flat/folded/worn, the cuff for hang.
export function sockPlacement(state: SockState, size: number, kind: SockKind, x: number, y: number, rot = 0) {
  const b = sockBox(state, size, kind);
  if (state === "hang") return `translate(${x} ${y}) rotate(${-rot})`;
  const a = (-rot * Math.PI) / 180;
  const halfH = Math.abs(Math.sin(a)) * (b.w / 2) + Math.abs(Math.cos(a)) * (b.h / 2);
  // rot follows the spec's convention: -90 turns the cuff up.
  return `translate(${x} ${y - halfH}) rotate(${-rot}) translate(${-b.cx} ${-b.cy})`;
}

// ---------------------------------------------------------------- foot ghost
function footGhostPath(u: number, kind: SockKind) {
  const { W, F } = wornGeo(u, kind);
  return [
    `M${0.12 * W} ${-0.86 * u}`,
    `L${0.12 * W} ${-0.24 * u}`,
    `C${0.12 * W} ${-0.09 * u} ${0.2 * W} ${-0.05 * u} ${0.32 * W} ${-0.05 * u}`,
    `L${F - 0.15 * u} ${-0.05 * u}`,
    `C${F - 0.07 * u} ${-0.05 * u} ${F - 0.06 * u} ${-0.19 * u} ${F - 0.16 * u} ${-0.205 * u}`,
    `L${W + 0.11 * u} ${-0.225 * u}`,
    `C${W + 0.01 * u} ${-0.24 * u} ${0.86 * W} ${-0.3 * u} ${0.86 * W} ${-0.42 * u}`,
    `L${0.86 * W} ${-0.86 * u}`,
  ].join(" ");
}

// ---------------------------------------------------------------- the element
const Steam: React.FC<{ x0: number; x1: number; top: number; t: number; fps: number; size: number }> = ({ x0, x1, top, t, fps, size }) => {
  const loop = 2 * fps;
  const len = Math.max(40, size * 0.32);
  return (
    <g fill="none" stroke={C.fg} strokeWidth={Math.max(3, size * 0.014)} strokeLinecap="round">
      {[0, 1, 2].map((i) => {
        const ph = (((t + i * (loop / 3)) % loop) + loop) % loop / loop; // 0..1
        const x = lerp(x0, x1, 0.22 + i * 0.28);
        const y = top - 14 - ph * len * 0.7;
        const op = (0.15 + 0.1 * Math.sin(i * 2.1 + 1)) * Math.sin(Math.PI * ph);
        const a = size * 0.035;
        const d = `M${x} ${y} c ${a} ${-len * 0.16} ${-a} ${-len * 0.33} 0 ${-len * 0.5} c ${a} ${-len * 0.16} ${-a} ${-len * 0.33} 0 ${-len * 0.5}`;
        return <path key={i} d={d} opacity={op} />;
      })}
    </g>
  );
};

export const Sock: React.FC<CustomElementProps> = ({ e, t, dur, fps }) => {
  const clipId = useSafeId("drop");
  if (t < 0) return null;
  const kind: SockKind = e.kind ?? "theirs";
  // A flat sock turned cuff up (the matched-pairs grid, rot -90) is drawn as the classic
  // sock icon: cuff up, the foot turned to the side.
  const upright = (e.state ?? "flat") === "flat" && Math.abs(Math.abs(e.rot ?? 0) - 90) < 1;
  const state: SockState = upright ? "hang" : e.state ?? "flat";
  const pattern: SockPattern = e.pattern ?? "plain";
  const size: number = e.size ?? 150;
  const rot: number = upright ? 0 : e.rot ?? 0;
  const anims: string[] = (Array.isArray(e.anim) ? e.anim : e.anim ? [e.anim] : []).map((a: any) => (typeof a === "string" ? a : Object.keys(a)[0]));

  let opacity = 1;
  let scale = 1;
  if (anims.includes("pop-in")) {
    const p = popIn(t);
    opacity *= p.opacity;
    scale = p.scale;
  }
  if (anims.includes("fade-out")) opacity *= 1 - prog(t, dur * 0.3, dur * 0.8, (x) => x);

  let dy = 0;
  if (e.drop) {
    const p = clamp01(t / Math.max(1, dur * 0.4));
    dy = (e.drop.toY - e.y) * p * p; // ease-in, no bounce
  }

  const b = sockBox(state, size, kind);
  const place = upright ? `translate(${e.x - b.cx} ${e.y + dy - b.y1})` : sockPlacement(state, size, kind, e.x, e.y + dy, rot);
  const shape = (filter?: string, op = 1) => (
    <g transform={place} filter={filter} opacity={op}>
      <SockShape state={state} size={size} kind={kind} pattern={pattern} ghost={!!e.ghost} />
    </g>
  );

  let body: React.ReactNode;
  if (e.ghost) body = shape();
  else if (e.outline === "red") {
    const pulse = anims.includes("pulse-outline") ? 0.7 - 0.3 * Math.cos(((t / fps) * 2 * Math.PI) / 1.2) : 1;
    body = (
      <>
        {shape("url(#outlineRed)", pulse)}
        {shape("url(#glow)")}
      </>
    );
  } else body = shape("url(#glow)");

  // Crease lines that ease out while the sock is smoothed flat.
  let creases: React.ReactNode = null;
  if (anims.includes("smooth") && state === "flat") {
    const k = 1 - prog(t, 0, dur * 0.7, ease);
    const { kx, ky } = scaleFor(kind);
    const X = (f: number) => f * size * kx, Y = (f: number) => f * size * ky;
    creases = (
      <g transform={place} opacity={k} stroke={C.bg} strokeWidth={Math.max(2, size * 0.012)} strokeLinecap="round" fill="none">
        <path d={`M${X(0.2)} ${Y(-0.27)} Q ${X(0.26)} ${Y(-0.19)} ${X(0.22)} ${Y(-0.11)}`} />
        <path d={`M${X(0.52)} ${Y(-0.16)} Q ${X(0.6)} ${Y(-0.09)} ${X(0.56)} ${Y(-0.02)}`} />
        <path d={`M${X(0.74)} ${Y(-0.15)} L ${X(0.8)} ${Y(-0.03)}`} />
      </g>
    );
  }

  // Dashed outline of an ordinary sock of yours, cuff aligned, 12 px higher.
  let ghostOf: React.ReactNode = null;
  if (e.ghost_of === "yours" && state === "flat") {
    const left = e.x - b.w / 2;
    ghostOf = (
      <g transform={`translate(${left} ${e.y - 12})`}>
        <SockShape state="flat" size={size} kind="yours" ghost />
      </g>
    );
  }

  let footGhost: React.ReactNode = null;
  if (e.foot_ghost && state === "worn") {
    const fo = e.foot_ghost === "fade" ? 1 - prog(t, 0, dur * 0.6, (x) => x) : 1;
    footGhost = (
      <g transform={place} opacity={fo}>
        <path d={footGhostPath(size, kind)} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="10 9" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowBlue)" />
      </g>
    );
  }

  let steam: React.ReactNode = null;
  if (e.steam) {
    const top = e.y - b.h;
    steam = <Steam x0={e.x - b.w / 2} x1={e.x + b.w / 2} top={top} t={t} fps={fps} size={size} />;
  }

  const content = (
    <g opacity={opacity} transform={scale !== 1 ? `translate(${e.x} ${e.y - b.h / 2}) scale(${scale}) translate(${-e.x} ${-(e.y - b.h / 2)})` : undefined}>
      {body}
      {creases}
      {footGhost}
      {ghostOf}
      {steam}
    </g>
  );
  if (e.drop) {
    return (
      <g>
        <clipPath id={clipId}>
          <rect x={-4000} y={-4000} width={8000} height={4000 + e.drop.toY} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>{content}</g>
      </g>
    );
  }
  return content;
};
