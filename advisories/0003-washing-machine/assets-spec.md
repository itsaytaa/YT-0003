# Advisory 0003: episode assets

Advisory 0003 needs a few things the kit can't draw. Build them in `video/src/episodes/0003-washing-machine/assets.tsx` and register them under exactly these names. They are already declared in `scenes.json → meta.customElements / meta.customShots`, and `validate.mjs` fails until they are registered.

Everything else in this episode is drawn by the kit. Don't redraw the person, inspector, bed, door, mat, window, clock, crowd, labels, marks, speech bubbles, cards, documents, case file, counter, calendar or seal.

**Style rules** (`brand/BRAND.md` §5):
- Use palette tokens from `video/src/theme.ts` only (`C.*`). No new hex values.
- Figures (the things the story is about: the washing machine and the socks) are solid `C.fg` (or `C.grey` for the grey sock) with `filter="url(#glow)"`, like the cat in Advisory 0001 and the vacuum in 0002. Details cut into a figure are drawn in `C.bg`.
- Furniture and set dressing (basket, bins, drawers, laundry pile) are outline-on-surface: `C.surface`/`C.surface2` fill, `C.line` stroke of 2–3 px, no glow.
- Annotations (sound arcs, the drum-view divider and gap outline) are 3 px blue or red strokes.
- Check every asset against a 360 px kit person standing on the ground line (y = 780). Hero objects are drawn about 1.3× life size, as in Advisory 0002 (a washing machine next to a standing person is ~250 px tall, not 176).
- Use the kit's animation helpers from `video/src/anim.ts` (`prog`, `lerp`, `ease`, `easeInOut`, `popIn`, `rand`, `shake`). Nothing bounces, nothing overshoots.

**Time units used below:** `t` (frames since the element appeared, after its `delay`) and `dur` (frames of that line) come from `CustomElementProps`. When `t < 0` the element hasn't appeared yet: render nothing. *Fraction* means a fraction of `dur`. *Seconds* means `t / fps`. The tableau already applies `opacity`; anims listed in an element's `anim` array must be implemented by the asset itself.

---

## Elements (tableau)

### `washing-machine` (figure: the episode's hero)
A front-loading washing machine seen straight on. It is the thing the story is about, so it is a **solid `C.fg` figure with glow**; its details are cut out in `C.bg`.

| Field | Meaning |
|---|---|
| `x`, `y`, `h` | Centre, floor (ground line) and total height (default 380). Width = 0.86·h. **The lid surface is exactly at `y − h`**: socks lying "on top" are placed there. |
| `door` | `closed` (default) or `open`: the round door swung open to the left, drawn as an outline-on-surface ellipse hinged at the left edge of the porthole (0.36·w wide, same height as the porthole ring), with the dark opening of the drum visible. |
| `drum` | `still` (default), `spin` (the drum's perforation pattern and contents rotate, ~1 turn per second, with a 1–2 px body vibration), `slow` (~1 turn per 3 s, no vibration). |
| `contents` | What shows through the door glass. `none` (default, dark drum), `socks` (4–5 small sock shapes in `C.dim`/`C.fg`, tumbling with the drum), `one-grey` (a single grey sock lying at the bottom of the drum, still). |
| `display` | Text in the control-panel display, right-aligned, IBM Plex Mono, `C.blue` (e.g. `20°`, `40°`, `END`). Empty when omitted. |
| `light` | The small status LED left of the display: `blue` (default when `drum` is `spin`/`slow`), `dim` (blue at 35%), `off` (`C.line`). |
| `color` | `fg` (default), `dim` (body in `C.dim`; used in the row of machines), `grey` (the slip shot, `C.grey`). |
| `age` | `old`: display text at 50%, the porthole ring slightly duller, and the body gives a small shudder (2 px, ~0.3 s) every ~2.2 s while the drum turns; the drum rotation is uneven (speed wobbles ±30%). |

**Shape (front view, `w` = 0.86·h, origin at floor centre):**
- **Body:** rounded rect, corner radius 0.04·h, from the floor to `y − h`. Small `C.bg` feet gap: a 0.02·h tall strip along the floor, inset 0.06·w, so it stands on two feet.
- **Control panel:** a `C.bg` band 0.12·h tall, inset 0.06·w, starting 0.05·h below the top. Inside it: a detergent drawer on the left (a rounded rect outline in `C.dim`, 0.3·w wide), a round programme dial in the middle (`C.dim` ring, r = 0.045·h, with a tick), the LED and the display on the right.
- **Porthole:** centred at 0.56·h from the top. Outer ring r = 0.33·w, filled `C.bg`; inside it a `C.surface2` ring 0.04·w wide (the door rim), then the glass (r = 0.27·w) filled `C.surface`, with a faint diagonal highlight streak (`C.fg` at 8%).
- **Drum:** behind the glass, a ring of small perforation dots (`C.line`, ~18 dots) that rotate with `drum`.
- **Door handle:** a short `C.bg` slot on the right of the porthole.

### `sock`
A single sock pictogram. The grey one is the episode's other hero.

| Field | Meaning |
|---|---|
| `x`, `y` | Horizontal centre. `y` is the surface it rests on (its lowest point) for `flat`, `folded` and `worn`; for `hang` it is the cuff (the point it is held by). |
| `size` | Length from cuff to toe in px (default 150). |
| `kind` | `theirs` (default): **the grey wool sock**, `C.grey`, ~10% longer and slimmer than yours at the same `size` (draw it at 1.1·size length, 0.9·width), with 5 thin ribbing lines on the cuff (`C.bg` at 50%) and a faint wool texture (a few short `C.bg` strokes at 15%). `yours`: an ordinary sock in `C.fg` with a `pattern`. |
| `pattern` | For `yours`: `stripe` (two `C.bg` bands near the cuff), `dots` (a loose grid of small `C.bg` dots), `heel` (heel and toe caps in `C.dim`), `plain`. |
| `state` | `flat` (default): the classic sock icon in profile lying on its side, cuff to the left, toe pointing right, heel down. `folded`: neatly folded in three into a flat rectangle (aspect ~3:1, size = its width) with two crisp `C.bg` fold lines and perfectly square corners. `hang`: held by the cuff, hanging straight down, the foot part turned to the left. `worn`: standing upright on its own in the shape of a foot that isn't there (an L: leg part vertical, foot part on the floor pointing right, a slight rounded heel), `size` = its height. |
| `rot` | Rotation in degrees around its centre (the matched-pairs grid uses −90: cuff up, toe to the side). |
| `steam` | `true`: three faint wavy lines (`C.fg` at 15–25%) rise from it and fade, looping every ~2 s, as if it is warm. |
| `ghost` | `true`: draw only a dashed outline (`C.dim`, 3 px, dash 8/8) of the sock: where a sock was. |
| `ghost_of` | `yours`: also draw a dashed outline of an ordinary sock of yours at the same `size`, cuff aligned with this one, slightly offset upward (12 px), so the grey one visibly sticks out ~10% past it. |
| `foot_ghost` | For `worn`: `true` draws a dashed blue outline of a bare foot and ankle fitting exactly inside the sock. `fade`: the same outline, fading out over the first 60% of the line while the sock keeps its shape. |
| `outline` | `red`: a 3 px red outline around the silhouette. With `anim: ["pulse-outline"]` it pulses (opacity 0.4 → 1 → 0.4, ~1.2 s). |
| `drop` | `{toY}`: falls from `y` to `toY` over the first 40% of the line (ease-in, no bounce) and then disappears below the bin's rim (clip it at `toY`). |
| `anim` | `pop-in` (kit `popIn`), `fade-out` (fades from 30% to 80% of the line, so the "one goes missing" beat lands mid-line), `smooth` (for `flat`: three small crease lines visible at first ease out and vanish over the first 70%). |

### `sock-pile`
The washing just taken out of the machine, lying on the floor. `x`, `y` (floor), `w` (default 320), `socks` (how many sock shapes show, default 3).
- Outline-on-surface lumps: 4–6 overlapping soft rounded shapes (`C.surface2` fill, `C.line` 2 px stroke), max height 0.22·w, a T-shirt sleeve shape among them.
- `socks` small sock silhouettes (`C.dim`, rotated at random with `rand`) poking out of the lumps. None of them is grey.

### `sock-basket`
The basket of odd socks. `x`, `y` (floor), `w` (default 420), `count` (default 12).
- A wicker basket: a trapezoid wider at the top (height 0.5·w), `C.surface` fill with a `C.line` 3 px outline and a light weave pattern (alternating short horizontal strokes, `C.line` at 40%). Two small handle loops.
- `count` single socks heaped above the rim and hanging over the edge, all different (`C.fg` and `C.dim`, mixed `pattern`s, random `rot` via `rand`). No two the same, and none grey.

### `bin`
`x`, `y` (floor), `h`, `kind`, `lid`, `ghost`.
- `kind: "pedal"`: a kitchen pedal bin, a cylinder in side view (width 0.6·h), with a domed lid and a small foot pedal at the base. With `lid: "open"` the lid is tilted back 70° on its hinge, showing the dark opening (`C.bg`).
- `kind: "wheelie"`: an outdoor wheelie bin (width 0.62·h), slightly tapered, a lid overhanging the front, a handle bar at the top back, one wheel visible at the bottom back.
- Both are outline-on-surface (`C.surface` fill, `C.line` 3 px).
- `ghost: true`: only a dashed `C.dim` outline of the bin on the ground (it has been collected).

### `drawers`
A chest of drawers, outline-on-surface. `x`, `y` (floor), `h` (default 420), `rows` (default 4), `open`, `sock`, `delay`.
- Body width 0.9·h (for `rows: 2`, width 1.2·h: a bedside chest). Each drawer front is a `C.surface2` rect with a small `C.dim` knob.
- `open: [i, …]`: those drawers stand open 0.12·h (drawn as the drawer front shifted down-right 10 px with its dark top edge visible).
- `open: "sequence"`: the drawers slide open one by one from top to bottom, each over 8 frames, 0.35 s apart, starting at `delay` seconds. Nothing visible opens them.
- `sock: i`: the grey sock's cuff pokes out of drawer `i` (a short grey shape over the top edge of that drawer).

### `steps`
Footprints on the floor that appear one by one: someone walking who is never shown.

| Field | Meaning |
|---|---|
| `fromX`, `toX`, `y` | First print, last print and the floor line. With `fromX == toX` it is a single print. |
| `pattern` | `alternate` (default): sock print, bare print, sock print… starting with a sock print. `sock` or `bare`: all prints of that kind. |
| `scale` | Size multiplier (default 1). Use 2.6 for floor close-ups. |
| `draw` | `"sequence"`: prints appear from `fromX` to `toX` over the first 75% of the line, each fading in over 4 frames. Without it they are all there from the start. |
| `sound` | `red` or `dim`: every **bare** print gets two or three concentric sound arcs (like the knock in Advisory 0002) that expand (radius 14 → 60 px at scale 1) and fade over 18 frames when that print appears. Sock prints never get arcs. |

- **Print shapes** (seen from a low side angle, so flattened): a sock print is a soft, featureless oval (36×8 px at scale 1, `C.line` at 60%). A bare print is the same size but slightly firmer (`C.dim` at 80%) with a narrower heel.
- **Spacing:** 110 px per step at scale 1, alternating 5 px above and below the floor line (left foot, right foot).
- **Opacity:** respect `opacity` (used at 0.6 for prints heard behind a door).

### `sock-feet`
A low close-up of the inspector's feet, for the slip (SLIP1) and the addendum (S69, S70). It shows only what the kit inspector never shows: below the coat. **Grey (`C.grey`) like the kit inspector's coat; dark details (the coat seam, the sock ribbing) in `C.line`.** No glow, no new colours.

| Field | Meaning |
|---|---|
| `x`, `y`, `h` | Centre between the feet, floor line, and the visible height from the floor to the top of the frame of the coat (default 520). |
| `left`, `right` | `sock` (a grey wool sock: rounded foot shape with the same cuff ribbing as the `sock` asset, slightly too long: the toe runs ~15% further than the leg's width suggests) or `bare` (a plain bare foot silhouette, no toes, no detail: `C.grey` with a 2 px `C.line` outline and a visible ankle, shorter and narrower than the socked foot, so it reads as bare by shape alone). |
| `color` | `grey` (default). In the slip shot the whole frame is greyscale anyway. |
| `anim: ["walk"]` + `walk: {dx}` | The feet take two slow steps to the right, moving `dx` px over the line (each step: the back foot lifts 10 px, moves forward, sets down over ~0.6 s; then a pause). Silent: no arcs. |
| `anim: ["lose-sock"]` + `walk: {dx}` | The same walk, but on the first step the left sock stays behind: it slides off the lifting foot and lies flat on the floor where the foot was (a `sock` `flat`, `theirs`). From then on the left foot is bare. |

- **Composition:** the coat hem (the bottom of the inspector's long coat, `C.grey`, with the dark centre seam line) fills the top 30% of `h`; two trouser legs (rounded rects, `C.grey`) come down from under it to the ankles; the feet stand on the floor line pointing right (seen from the side).
- **Scale:** at `h` 520 each foot is ~150 px long. It must read as the same figure as `brand/reference/characters.png` → inspector, just much closer.

---

## Shot type: `drum-view`

A full-frame close-up through the washing machine's door glass. It is the episode's signature visual: the place where socks go. Fields live under `shot.drum`. `shot.accent` sets the caption emphasis colour.

**Look:**
- **Door:** the porthole fills most of the frame, centred at (960, 470): an outer `C.surface2` door rim (r = 360) with a `C.line` 3 px outline, then the glass (r = 300), filled `C.surface` with a faint diagonal highlight streak (`C.fg` at 6%).
- **Drum:** behind the glass, the drum's back wall in `C.bg` with a ring of perforation dots (`C.line`, ~40 dots in two rings) and three baffles (short rounded `C.surface2` ribs on the drum edge at 120° apart). Dots and baffles rotate with `spin`.
- **Door seal (the gap):** around the inside of the glass, the rubber seal is a 26 px `C.surface2` ring. At the lower left (about 7–8 o'clock) the seal has a dark crescent-shaped gap between seal and drum (`C.bg`, ~120 px long, 18 px at its widest). That is where socks go.
- **Contents:** `contents` lists the socks in the drum (each `{kind, pattern}`, same look as the `sock` asset; `kind: "theirs"` = grey wool). They tumble: each one rides up with the drum and falls back, positioned along the drum wall with `rand`-based offsets, at ~0.6× the drum speed.

| Field | Meaning |
|---|---|
| `spin` | `slow` (~1 turn per 3 s) or `fast` (~1 turn per second). |
| `contents` | The socks in the drum (see above). |
| `mode` | `sort`: over the line the tumbling slows to a stop and the socks drift into two groups: all `yours` on the left half, all `theirs` on the right half, each settling still. A thin `C.blue` line draws down the middle of the glass (top to bottom, 3 px, over 0.5 s) once they have separated. `sorted`: already separated and still, with the blue line drawn. |
| `dark` | `true`: the whole drum at 60% brightness. |
| `labels` | `true`: mono labels `YOURS` (under the left group) and `THEIRS` (under the right group), 24 px, letter-spaced, `C.dim`, drawing on with a thin leader line. |
| `gap` | `true`: the gap at the lower left is outlined in dashed blue (3 px) and pulses once at the start. |
| `through` | `{kind, pattern, at}`: at line fraction `at`, the sock of that kind (pattern) slides along the seal into the gap over ~0.8 s, getting thinner as it goes, and is gone. The gap closes slightly behind it. Nothing else in the drum reacts. |

---

## Sound

No new sound effects. The footsteps are silent on purpose (the sound arcs carry them visually, and the drone bed ducks on `silence`), and the kit's `click`, `static`, `page`, `stamp` and `tick` cover the rest. If a footstep sound feels necessary after review, it is a kit change: add it to `brand/audio.json` and `brand/sfx/`, log it in `brand/CHANGELOG.md`, and keep it very soft (a single soft thud on bare prints only).

## After this episode

`washing-machine`, `sock`, `drawers` and `bin` are likely to come back in household advisories, and `steps` overlaps with Advisory 0002's `dust-trail` and `knock` (prints on the floor, sound arcs). If Advisory 0004+ needs one of them, promote it into the kit (`BRAND.md` §6) and add it to the props reference sheet. `sock-feet` should stay an episode asset: the inspector's look is fixed by the kit and its feet stay off screen in other advisories.
