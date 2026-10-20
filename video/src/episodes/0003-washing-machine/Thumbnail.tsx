// YouTube thumbnail for Advisory 0003, 1280x720 (brand/BRAND.md §7): near-black, one big
// pictogram moment, 2–4 words in the display face with a red rule, a small blue
// ADVISORY tag, stronger vignette. The moment: the washing machine with its door open,
// and on the floor, apart from the washing, the one grey sock that is not yours.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, DISPLAY_STYLE } from "../../theme";
import { Defs } from "../../figures/Defs";
import { InspectorBody } from "../../figures/Inspector";
import { Grain, Vignette } from "../../overlays/Overlays";
import { loadFonts } from "../../fonts";
import { Machine } from "./machine";
import { SockShape, sockBox } from "./sock";
import { SockPile } from "./household";

loadFonts();

const FLOOR = 652;

export const Thumbnail: React.FC = () => {
  const sock = sockBox("flat", 250, "theirs");
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720">
        <Defs />
        <defs>
          <radialGradient id="thumbSock" cx={520} cy={FLOOR - 20} r={230} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.fg} stopOpacity={0.12} />
            <stop offset="1" stopColor={C.fg} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="thumbDrum" cx={980} cy={FLOOR - 230} r={380} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.blue} stopOpacity={0.08} />
            <stop offset="1" stopColor={C.blue} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1280} height={720} fill="url(#thumbDrum)" />
        {/* the inspector, behind the machine at its left edge */}
        <g transform={`translate(800 ${FLOOR}) scale(6.1)`} opacity={0.2}>
          <InspectorBody pose="stand" />
        </g>
        <Machine x={1000} y={FLOOR} h={480} door="open" drum="still" contents="none" light="off" t={0} fps={30} />
        <SockPile e={{ el: "sock-pile", x: 900, y: FLOOR, w: 300, socks: 3 }} t={0} dur={1} fps={30} />
        {/* the grey sock, apart from the washing, a little brighter than anything else */}
        <ellipse cx={520} cy={FLOOR - 30} rx={230} ry={90} fill="url(#thumbSock)" />
        <g transform={`translate(${520 - sock.w / 2} ${FLOOR}) rotate(-3 ${sock.w / 2} 0)`} filter="url(#glow)">
          <SockShape state="flat" size={250} kind="theirs" />
        </g>
        <text x={64} y={92} fontFamily={FONT.mono} fontWeight={600} fontSize={30} letterSpacing="0.28em" fill={C.blue}>
          ADVISORY 0003
        </text>
        <text x={58} y={232} style={DISPLAY_STYLE} fontSize={150} letterSpacing="0.01em" filter="url(#glowSoft)">
          <tspan fill={C.red}>NOT</tspan>
          <tspan fill={C.fg}> YOURS</tspan>
        </text>
        <rect x={64} y={256} width={712} height={12} fill={C.red} filter="url(#glowRed)" />
      </svg>
      <Vignette strength={0.9} />
      <Grain frame={3} />
    </AbsoluteFill>
  );
};
