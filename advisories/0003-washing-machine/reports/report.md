# Advisory 0003: build report

"If Your Washing Machine Ever Gives Back One Extra Sock… DO NOT WEAR IT"

| | |
|---|---|
| Final video | `out/advisory-0003-washing-machine-final.mp4`: 1920×1080, 30 fps, H.264 (CRF 16) + AAC 48 kHz 320 kb/s (gitignored, 267 MB) |
| Runtime | **4:54.0** (8,821 frames, including the 3 s end card) |
| Pause scale factor | **1.0000**: the unscaled runtime (4:54.03) is inside 4:45–5:30, so no `pauseAfter` was scaled |
| Loudness | **−14.1 LUFS** integrated, **−1.3 dBTP**, LRA 3.2 LU (`ffmpeg -af ebur128=peak=true`) |
| Voice | **minimax/speech-2.8-hd, `English_ManWithDeepVoice`** (the locked channel voice, `brand/voice.json → chosen`); no voice test was run |
| OpenRouter cost | **$0.41** total, measured as key usage minus this advisory's baseline (`reports/budget.json`): voice-over $0.348 (99 lines + 2 regenerations) · STT check $0.031 · alt takes for L071 and their three-model scoring ≈ $0.03. The budget guard stayed at $2 and your cap was $5.00 |
| Thumbnail | `out/thumbnail.png` (1280×720) |
| Metadata | `metadata.md`; the CHAPTERS block is filled from the real timings and starts at 0:00 |
| Review | `out/review/contact-sheet.png` + `out/review/<shotId>.png` (100 shots); asset test sheets in `reports/asset-sheets/` |

## Output files
- `advisories/0003-washing-machine/out/advisory-0003-washing-machine-final.mp4`: the mastered upload file (gitignored)
- `advisories/0003-washing-machine/out/advisory-0003-washing-machine.mp4`: the Remotion render before mastering (gitignored)
- `advisories/0003-washing-machine/out/thumbnail.png`
- `advisories/0003-washing-machine/out/review/contact-sheet.png`
- `video/public/episodes/0003-washing-machine/lines/L001–L099.wav`: the trimmed line audio (committed, so the video can be rendered again with no API calls)

## STT check (whisper-1, WER ≤ 0.15)
- **98 of 99 lines pass** on the first take.
- **L071** "You will feel relieved. You will run a wash." Every take is transcribed as "run **awash**", a homophone, on whisper-1, whisper-large-v3 and gpt-4o-transcribe (WER 0.222). The script regenerated it twice and then accepted it.
  - The accepted take had a real problem that WER can't see: a **0.61 s gap inside "run … a wash"**, which whisper-large-v3 heard as "You will run. Awash."
  - I generated four alternative takes (`scripts/alt-takes.mjs`) and checked each for gaps inside the sentence. **Take 3** has a single 0.37 s pause, between the two sentences, so it replaced the line.
  - It was trimmed exactly as `stt-check.mjs` does (energy bounds at −42 dB, 0.15 s pad, the same fades). This is logged in `reports/stt-check.json → lines.L071.manualFix`.
- Every other line was checked for long pauses inside a sentence (silences over 0.4 s compared with the punctuation in the text). None were found.
- The slip line **L066** got the post treatment (−3.5 dB, low shelf +2 dB at 220 Hz, high shelf −3 dB at 5 kHz).
- Lines regenerated: **L071 ×2**, plus 4 alt takes (take 3 kept). Details: `reports/stt-check.json`, `reports/tts-log.json`.

## Episode assets (`video/src/episodes/0003-washing-machine/`)
All eight elements and the `drum-view` shot are registered under the names in `scenes.json → meta`, and validate reports 0 errors and 0 warnings. They use palette tokens only, with no new hex values.

| File | Contents |
|---|---|
| `machine.tsx` | `washing-machine` (every `door`/`drum`/`contents`/`display`/`light`/`color`/`age` option) and the shared tumble motion |
| `sock.tsx` | `sock`: every state, kind, pattern and option (`steam`, `ghost`, `ghost_of`, `foot_ghost`, `outline`/`pulse-outline`, `drop`, `pop-in`, `fade-out`, `smooth`); its `SockShape` drawing is reused everywhere a sock appears |
| `household.tsx` | `sock-pile`, `sock-basket`, `bin` (pedal/wheelie, lid, ghost), `drawers` (rows, `open: [i]`, `open: "sequence"`, `sock`) |
| `steps.tsx` | `steps` (alternate/sock/bare, scale, draw sequence, red/dim sound arcs) |
| `feet.tsx` | `sock-feet` (sock/bare per foot, `walk`, `lose-sock`) |
| `drum.tsx` | `drum-view` (slow/fast, sort/sorted, dark, labels, gap, through) |

The asset test sheets (`reports/asset-sheets/*.png`) show every state, a 360 px kit person and a kit cat next to a 250 px machine, and a standing kit inspector next to `sock-feet`. They were rendered from a temporary composition with its own entry point in the episode folder, never registered in the shared Root; it was deleted after use.

## Deviations (and why)

### Process
- **Branch:** the work is committed on `claude/confident-goodall-ufx6u4`, the branch this session was told to use, instead of `advisory/0003-washing-machine`.
- **`node scripts/sfx.mjs` fails** (a kit bug): the ffmpeg recipes in `brand/audio.json` write to `audio/sfx/…`, but the script copies from `brand/sfx/…`, so the first recipe fails with "No such file or directory". I didn't edit the kit. I ran the drone recipe by hand with the output path changed to `brand/sfx/drone.wav` and copied it to `video/public/sfx/` (both gitignored). The other SFX were already committed and are unchanged.
- **Mastering:** the single-pass command in CLAUDE.md (`loudnorm=I=-14:TP=-2.0:LRA=11`) gave −14.5 LUFS and −1.8 dBTP. I used a two-pass `loudnorm` instead (measured pass, then `I=-14:TP=-1.5:LRA=11` with the measured values and `offset=0.38`), which lands at −14.1 LUFS and −1.3 dBTP. Both meet the ≤ −1.0 dBTP ceiling; this one is closer to −14. No stamp needed a clip-gain ride. The video stream is copied unchanged.
- **Studio scrub:** this is a headless container, so instead of scrubbing in Remotion Studio I checked motion with frame strips (5 frames across the line) for S07, S09, S12, S16, S18b, S23b, S29, S41, S43, S48–S52, SLIP1, S61, S61b, S62, S64, S69, S70, S74 and S75.

### Layout changes in `scenes.json` (no line text touched)
- **S04, S22, S22b, S23, S23b**, "holding the grey sock up by its cuff": the kit person has no hold-up pose, and the sock floated in front of a standing figure. These shots now use the kit `push` pose (arm held straight out), with the sock's cuff in that hand. The original sock x (720 / 500) was already exactly at that hand.
- **S48:** the desc asks for bare prints "with small sound arcs", but the element had no `sound`. I added `sound: "dim"`, so the arcs go dim (S48) → red (S49b–S52).
- **S49, S49b:** the `steps` elements get an `x` (= `fromX`). The engine keys elements on el/x/y, so without it the bare print in the S49b hold shared a key with the sock print and appeared already finished.

### Corrections in `patches.ts` (applied after the voice was locked)
- **S18b:** the worn sock gets a distinct key, so the foot-outline fade starts on its own line, not on S18's.
- **S23b:** the fourth "not mine" bubble pops at 0.47 s (instead of 0.7 s), and its red circle at 0.75 s. That is the frame where the kit counter's ease-out shows 4, so they land together, as BUILD.md asks.
- **S43:** the kit `boundary` draws through a glow filter. A perfectly level line has a zero-height box, so the filter region is empty and the dashed floor path never showed. A slight floor-perspective slope (y 818 → 794) makes it visible.
- **S52:** the desc says "the final one is bare". 180→900 at 110 px per step gives 7 prints, ending on a sock print. Starting at x 120 gives 8 prints, the last one bare at x 890, right where the faint inspector appears.

### Interpretations of `assets-spec.md`
- **`sock` with `rot: -90`** (the pairs grid in S09, S12, S12b and S57): the spec says "cuff up, toe to the side". A flat sock turned upright is drawn as the classic sock icon (cuff up, foot turned to the side), not as the long flat profile stood on end, which read as a stick. Its `y` is still the lowest point.
- **`sock-feet` coat:** at SLIP1's scale (machine 600 px) the inspector would be about 1,250 px tall, so the coat carries on past the top of the frame instead of ending in a box at `y − h`. The bottom 30% of `h` is the hem, as specified.
  - The socked foot is about 172 px long at h 520 (the spec says ~150; I made it longer so "slightly too long" reads), and the bare foot is about 136 px. The bare foot reads as bare by shape: a slim ankle, an arch, a low toe line.
- **`drawers` with `delay`:** the chest is visible from the start, and `delay` only delays its opening sequence (S41's right chest).
  - An open drawer is the front shifted down-right, with the dark inside and its side walls showing above it. The front drops by max(10 px, 0.06·h) so the opening reads at 440 px.
- **`drum-view` back wall:** the gap is a `C.bg` crescent, so the drum around it is drawn as a `C.surface` cylinder wall, with a `C.bg` back wall in the middle. Otherwise the gap would be invisible against a dark drum.
  - The glass is a translucent `C.surface` tint (18%) plus a soft diagonal highlight, so the drum is visible through it.
- **`steps`, single print** (`fromX == toX` with `draw: "sequence"`): the print lands 6 frames after the cut instead of on frame 0, so its sound arcs are seen as an event.
- **Wool texture:** a few tiny V-shaped knit marks in `C.bg` at 15%.
- **No footstep sound** was added; the steps stay silent, as the spec intends.

### `brand/BRAND.md`
- No kit or brand files were changed, and `check-reference.mjs` passes (see below).
- The inspector appears only faintly in S36 (7%) and S52 (8%, at 60–90% of the line) before S74. SLIP2's inspector bust is in `scenes.json` as written (the slip's own visual), and S74 is the first clear, full-figure reveal.

## Kit issues found (for the template, not fixed here)
1. `scripts/sfx.mjs` vs the `brand/audio.json` recipes: the output paths (`audio/sfx/`) don't match the copy source (`brand/sfx/`).
2. `Boundary` (and any element drawn through `glowBlue`/`glowRed`) disappears when the line is perfectly horizontal or vertical (an SVG filter region on a zero-height box). Use `filterUnits="userSpaceOnUse"` with a padded region.
3. `CustomElementProps` has no per-line clock (`sub`/`subDur`), so an episode asset whose animation should restart on a `hold` line needs a key trick (S18b here). Tableau's `elKey` also ignores `fromX`-style fields, so two `steps` elements can collide.

## Script notes (reported, not changed)
- No wording problems found. The only "issue" is the L071 homophone ("a wash" / "awash") in STT, which is not a script error.
- `brand/voice.json → chosen.slipTreatment` still says "the slip line (L070)" (that was 0001's id). The slip lines actually come from `meta.slipLines` (L066 here), so it has no effect.

## Verification
- `cd video && npx tsc --noEmit`: clean.
- `node scripts/validate.mjs --ep 0003`: **0 errors, 0 warnings**. `--ep 0001`: 0 errors, plus 10 earlier warnings about close-up corners at y=860, which 0001's `liftCloseUps` patch handles at render time.
- `node scripts/check-reference.mjs`: characters, props, layout and cards all at **SSIM 1.0000** (the kit is untouched).
- **Advisory 0001 still renders:** frames 4500–4589 to MP4 (H.264 + AAC) and the end-card still, with no errors. I did not do a full render of 0001.
- **Final file:** `ffprobe` reports 1920×1080, 30 fps, H.264 + AAC 48 kHz, 294.1 s. I spot-checked frames from SLIP1 (greyscale), S61, S74 and the end card.
- **OpenRouter spend** for this advisory: **$0.41** (key usage minus the baseline in `reports/budget.json`).
