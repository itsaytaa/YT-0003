// Advisory 0003: a low close-up of the inspector's feet (the slip and the addendum only).
// The same grey figure as the kit inspector, seen from the side below the coat hem:
// coat hem, trouser legs, and grey wool socks that are slightly too long.
// Spec: assets-spec.md → `sock-feet`. No glow, no new colours.
import React from "react";
import { C } from "../../theme";
import { clamp01, easeInOut, lerp, prog } from "../../anim";
import type { CustomElementProps } from "../../episode-context";
import { SockShape, sockBox } from "./sock";

type FootKind = "sock" | "bare";

// Foot outlines, origin = back of the heel on the floor, facing right, in units of h.
function footPath(kind: FootKind, h: number) {
  const top = -0.26 * h;
  if (kind === "sock") {
    const A = 0.1 * h, L = 0.33 * h, fh = 0.078 * h;
    return {
      ankle: A,
      d: [
        `M0 ${top}`,
        `L0 ${-0.065 * h}`,
        `C0 ${-0.016 * h} ${0.02 * h} 0 ${0.065 * h} 0`,
        `L${L - 0.05 * h} 0`,
        `C${L - 0.008 * h} 0 ${L} ${-0.012 * h} ${L} ${-0.032 * h}`,
        `C${L} ${-0.058 * h} ${L - 0.028 * h} ${-fh} ${L - 0.08 * h} ${-fh}`,
        `L${A + 0.05 * h} ${-fh - 0.006 * h}`,
        `C${A + 0.012 * h} ${-fh - 0.01 * h} ${A} ${-fh - 0.03 * h} ${A} ${-0.135 * h}`,
        `L${A} ${top}`,
        "Z",
      ].join(" "),
    };
  }
  // Bare: shorter and narrower, a slim ankle, an arch under the sole and a low toe line.
  // No toes or other detail: it reads as bare by shape alone.
  const A = 0.064 * h, L = 0.262 * h, x0 = 0.018 * h;
  return {
    ankle: A + x0,
    d: [
      `M${x0} ${top}`,
      `L${x0} ${-0.09 * h}`,
      `C${x0} ${-0.045 * h} ${x0 - 0.014 * h} ${-0.008 * h} ${x0 + 0.03 * h} 0`,
      `Q${0.11 * h} ${-0.022 * h} ${0.18 * h} 0`,
      `L${L - 0.03 * h} 0`,
      `C${L - 0.004 * h} 0 ${L} ${-0.008 * h} ${L} ${-0.02 * h}`,
      `C${L} ${-0.033 * h} ${L - 0.022 * h} ${-0.04 * h} ${L - 0.06 * h} ${-0.043 * h}`,
      `C${0.15 * h} ${-0.05 * h} ${x0 + A + 0.03 * h} ${-0.068 * h} ${x0 + A + 0.006 * h} ${-0.1 * h}`,
      `C${x0 + A} ${-0.11 * h} ${x0 + A} ${-0.12 * h} ${x0 + A} ${-0.13 * h}`,
      `L${x0 + A} ${top}`,
      "Z",
    ].join(" "),
  };
}

const Foot: React.FC<{ kind: FootKind; h: number; color: string; squash?: number }> = ({ kind, h, color, squash = 1 }) => {
  const f = footPath(kind, h);
  const sw = Math.max(1.5, h * 0.0035);
  return (
    <g transform={squash !== 1 ? `scale(1 ${squash})` : undefined}>
      <path d={f.d} fill={color} stroke={kind === "bare" ? C.line : "none"} strokeWidth={kind === "bare" ? 2 : 0} strokeLinejoin="round" />
      {kind === "sock" && (
        <g stroke={C.line} strokeWidth={sw} strokeLinecap="round">
          {/* cuff ribbing just below the trouser hem, and the toe seam */}
          {[1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${(f.ankle * i) / 6} ${-0.2 * h} V ${-0.15 * h}`} />
          ))}
          <path d={`M${-1} ${-0.148 * h} H ${f.ankle + 1}`} />
          <path d={`M${0.27 * h} ${-0.074 * h} Q ${0.285 * h} ${-0.04 * h} ${0.275 * h} ${-0.004 * h}`} fill="none" opacity={0.7} />
        </g>
      )}
    </g>
  );
};

// A trouser leg from the hip to the ankle, as a slightly tapered quad.
const Leg: React.FC<{ hx: number; hy: number; ax: number; ay: number; w: number; color: string }> = ({ hx, hy, ax, ay, w, color }) => {
  const dx = ax - hx, dy = ay - hy;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const w0 = w * 0.55, w1 = w * 0.5;
  const d = `M${hx + nx * w0} ${hy + ny * w0} L ${ax + nx * w1} ${ay + ny * w1} L ${ax - nx * w1} ${ay - ny * w1} L ${hx - nx * w0} ${hy - ny * w0} Z`;
  return <path d={d} fill={color} stroke={C.line} strokeWidth={2} strokeLinejoin="round" />;
};

export const SockFeet: React.FC<CustomElementProps> = ({ e, t, dur, fps }) => {
  if (t < 0) return null;
  const h = e.h ?? 520;
  const color = C.grey;
  const anims: string[] = (Array.isArray(e.anim) ? e.anim : e.anim ? [e.anim] : []).map((a: any) => (typeof a === "string" ? a : Object.keys(a)[0]));
  const walking = anims.includes("walk") || anims.includes("lose-sock");
  const loseSock = anims.includes("lose-sock");
  const dx = walking ? e.walk?.dx ?? 300 : 0;
  const off = walking ? dx / 4 : 0.17 * h; // half the distance between the feet
  const legW = 0.15 * h;

  // Two slow steps: the back (left, far) foot first, then the right (near) foot.
  const D = 0.65 * fps;
  const s0 = Math.round(dur * 0.08);
  const s1 = Math.max(s0 + D + 0.3 * fps, Math.round(dur * 0.48));
  const p0 = walking ? prog(t, s0, s0 + D, easeInOut) : 0;
  const p1 = walking ? prog(t, s1, s1 + D, easeInOut) : 0;
  const c0 = e.x;
  const cx = c0 + 2 * off * (p0 + p1);
  const leftX = c0 - off + 4 * off * p0; // ankle positions (leg centre)
  const rightX = c0 + off + 4 * off * p1;
  const lift = (p: number) => (p > 0 && p < 1 ? -10 * Math.sin(Math.PI * p) : 0);
  const tilt = (p: number) => (p > 0 && p < 1 ? -5 * Math.sin(Math.PI * p) : 0);

  // Which foot wears what. With lose-sock the left sock stays behind on the first step.
  const leftKind: FootKind = loseSock ? (p0 > 0.12 ? "bare" : "sock") : e.left ?? "sock";
  const rightKind: FootKind = e.right ?? "sock";

  const y = e.y;
  const hemY = y - 0.7 * h; // bottom of the coat
  const ankleY = y - 0.185 * h; // trouser hem
  const sway = walking ? (Math.sin(Math.PI * p0) - Math.sin(Math.PI * p1)) * 0.8 : 0;

  const foot = (ax: number, kind: FootKind, p: number) => {
    const f = footPath(kind, h);
    const heelX = ax - f.ankle / 2;
    return (
      <g transform={`translate(${heelX} ${y + lift(p)}) rotate(${tilt(p)} ${0.15 * h} 0)`}>
        <Foot kind={kind} h={h} color={color} />
      </g>
    );
  };

  // The sock that came off: it slips off the lifting foot and settles flat.
  let lostSock: React.ReactNode = null;
  if (loseSock && p0 > 0) {
    const f = footPath("sock", h);
    const heelX = c0 - off - f.ankle / 2;
    const settle = clamp01((p0 - 0.05) / 0.4);
    const size = 0.36 * h;
    const b = sockBox("flat", size, "theirs");
    lostSock = (
      <g>
        {settle < 1 && (
          <g transform={`translate(${heelX + settle * 0.02 * h} ${y})`} opacity={1 - settle}>
            <Foot kind="sock" h={h} color={color} squash={lerp(1, 0.3, settle)} />
          </g>
        )}
        <g transform={`translate(${heelX - b.w * 0.18} ${y})`} opacity={settle}>
          <SockShape state="flat" size={size} kind="theirs" />
        </g>
      </g>
    );
  }

  // Seen from the side the hips nearly overlap; the legs open from under the coat.
  const spread = Math.min(off * 0.25, 0.035 * h);
  const farHip = cx - spread, nearHip = cx + spread;
  const hipY = hemY - 0.06 * h;
  const coatTop = y - h;
  // The coat carries on past the top of the frame (at this scale the inspector is about
  // twice the height of the frame), slightly flared at the hem.
  const hemHalf = 0.255 * h, topHalf = 0.225 * h, far = coatTop - 3 * h;
  const coat = `M${cx - topHalf} ${far} L ${cx + topHalf} ${far} L ${cx + topHalf} ${coatTop} L ${cx + hemHalf} ${hemY - 0.014 * h} Q ${cx + hemHalf} ${hemY} ${cx + hemHalf - 0.014 * h} ${hemY} L ${cx - hemHalf + 0.014 * h} ${hemY} Q ${cx - hemHalf} ${hemY} ${cx - hemHalf} ${hemY - 0.014 * h} L ${cx - topHalf} ${coatTop} Z`;
  return (
    <g>
      {/* far side: left foot and leg, a shade darker */}
      <g>
        {lostSock}
        {foot(leftX, leftKind, p0)}
        <Leg hx={farHip} hy={hipY} ax={leftX} ay={ankleY + lift(p0)} w={legW} color={color} />
        <g opacity={0.2}>
          <Leg hx={farHip} hy={hipY} ax={leftX} ay={ankleY + lift(p0)} w={legW} color={C.bg} />
          <g transform={`translate(${leftX - footPath(leftKind, h).ankle / 2} ${y + lift(p0)}) rotate(${tilt(p0)} ${0.15 * h} 0)`}>
            <path d={footPath(leftKind, h).d} fill={C.bg} />
          </g>
        </g>
      </g>
      {/* near side: right foot and leg */}
      {foot(rightX, rightKind, p1)}
      <Leg hx={nearHip} hy={hipY} ax={rightX} ay={ankleY + lift(p1)} w={legW} color={color} />
      {/* the coat hem */}
      <g transform={`rotate(${sway} ${cx} ${coatTop})`}>
        <path d={coat} fill={color} />
        <path d={`M${cx + 0.03 * h} ${far} L ${cx + 0.034 * h} ${hemY}`} stroke={C.line} strokeWidth={2.5} />
        <path d={`M${cx - hemHalf + 6} ${hemY - 0.032 * h} L ${cx + hemHalf - 6} ${hemY - 0.032 * h}`} stroke={C.line} strokeWidth={2} opacity={0.6} />
      </g>
    </g>
  );
};
