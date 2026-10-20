// Advisory 0003 only: corrections applied on top of scenes.json by the engine, for when
// a shot's structured fields don't match its `desc` after review. Prefer fixing scenes.json
// directly while the advisory is still being written; use patches once the voice is
// generated and the timings are locked. Never change kit files for one episode.
import type { El, EpisodePatches } from "../../engine";

export const patches: EpisodePatches = {
  elements: {
    // S18b "the dashed foot outline fades away": the worn sock carries over from S18 with
    // the same key, so its clock (and the fade) would start at S18. A distinct key makes it
    // a new element on S18b; nothing visible changes at the cut.
    S18b: (els: El[]) => els.map((e) => (e.el === "sock" ? { ...e, text: "fade" } : e)),
    // S43 "a blue dashed path draws on the floor ... to the machine": the kit boundary has a
    // glow filter, and a perfectly level line has a zero-height box, so it never shows.
    // A slight floor perspective gives it height.
    // S23b "a fourth 'not mine' bubble pops up ... and the counter ticks to 4": the kit
    // counter eases out and shows 4 at ~0.53 s on this line, so the bubble pops with it.
    S23b: (els: El[]) =>
      els.map((e) => (e.el === "speech" && e.x === 1000 ? { ...e, delay: 0.47 } : e.el === "mark" && e.x === 1000 ? { ...e, delay: 0.75 } : e)),
    // S52 "the final one is bare": 180→900 gives 7 prints ending on a sock print; starting
    // at 120 gives 8 prints, the last one bare at x 890, where the inspector stands.
    S52: (els: El[]) => els.map((e) => (e.el === "steps" ? { ...e, fromX: 120 } : e)),
    S43: (els: El[]) => els.map((e) => (e.el === "boundary" ? { ...e, x1: 40, y1: 818, x2: 1000, y2: 794 } : e)),
  },
};
