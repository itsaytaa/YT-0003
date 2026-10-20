# Advisory 0003: build the video

You are building one finished YouTube video for the channel **Not Covered**: **"If Your Washing Machine Ever Gives Back One Extra Sock… DO NOT WEAR IT"**. The narrator is the fictional **Department of Unlisted Risks**. The video is drawn in code with the channel kit (Remotion + React + SVG) and rendered to MP4. The only AI-generated asset is the voice-over (OpenRouter).

The creative decisions are made. Don't ask the owner for any, and never change the wording of a line's `voice` or `caption`. If something in the script looks wrong, report it in the build report instead of fixing it. The only thing to ask for is `OPENROUTER_API_KEY` if `.env` doesn't have it.

## Where things are

This repo (**itsaytaa/YT-0003**) is the studio for this advisory: the channel kit (kit 1.1.0, seeded from `itsaytaa/YT-Notcovered-Template`), Advisory 0001 for reference, and Advisory 0003 already scaffolded and registered.

| File | Role |
|---|---|
| `advisories/0003-washing-machine/BUILD.md` | These instructions. |
| `advisories/0003-washing-machine/brief.md` | Story logic, directives, continuity with Advisories 0001 and 0002, the asset list. |
| `advisories/0003-washing-machine/scenes.json` | **Source of truth.** 99 lines (voice text, caption, shot, pause, emphasis, sfx, transition) and 100 shots. It validates against the kit, apart from the episode assets you build. |
| `advisories/0003-washing-machine/script.md` | Read-through version of `scenes.json`. |
| `advisories/0003-washing-machine/assets-spec.md` | Exact spec for the eight new elements and one new shot type this episode needs. |
| `advisories/0003-washing-machine/metadata.md` | YouTube title, description, tags and pinned comment. The chapters are filled in at step 8. |
| `advisories/0003-washing-machine/preview/contact-sheet.png` | One still per shot, rendered with **placeholder** assets: rough white/grey blocks stand in for the machine, socks, footprints and drum. It shows the intended composition of the kit parts. It is not the look of the new assets. |
| `video/src/episodes/0003-washing-machine/` | The episode's code: `index.ts` (wiring, done), `assets.tsx` (empty: you build it), `patches.ts`, `Thumbnail.tsx` (template: you replace the scene). |

## Step 0: Set up

```sh
cd video && npm ci && cd ..
node scripts/sfx.mjs            # rebuilds the drone bed (not committed)
node scripts/timings.mjs --ep 0003 --estimate
node scripts/validate.mjs --ep 0003
```

- Read `CLAUDE.md` and `brand/BRAND.md` before anything else. Use `brand/reference/*.png` for the look and `brand/catalog.json` for what the kit can draw.
- Expect exactly **9 errors** at this point, all "custom asset … is not registered". Anything else is a problem: stop and report it.
- Work on a branch: `git checkout -b advisory/0003-washing-machine`.
- If you work from the zip package instead of this repo: clone `itsaytaa/YT-Notcovered-Template` (kit 1.1.0 or later), run `node scripts/new-advisory.mjs 0003 washing-machine "If Your Washing Machine Ever Gives Back One Extra Sock… DO NOT WEAR IT"`, and copy the package's files into `advisories/0003-washing-machine/`, overwriting the skeletons. If Advisory 0002 is already in that repo, also check whether it registered `robot-vacuum`, `phone` or `wall` in its own episode folder; 0003 uses none of them, so there is nothing to promote.

## Step 1: Build the episode assets

1. Implement everything in `assets-spec.md` in `video/src/episodes/0003-washing-machine/assets.tsx`, registered under the exact names. Keep it to that one file, plus small helper files in the same folder if it gets long. **Don't edit kit files** (`video/src/` outside `episodes/`, or `brand/`).
2. Before using them in shots, build an asset test sheet: a temporary composition in the episode folder, not registered in the shared Root.
   - Show the washing machine in every state: door open/closed, every `drum`, every `contents`, `display`, every `light`, `dim`, `grey`, `age: old`.
   - Show the sock in every `state` for both kinds, every `pattern`, and with `steam`, `ghost`, `ghost_of`, `foot_ghost` (true and mid-fade), `outline`, `drop` and `smooth`.
   - Show the pile, the basket, both bins (lid open/closed, ghost), the drawers (2 and 4 rows, `open: [0]`, mid-sequence, `sock`), the steps (alternate, sock, bare, scale 2.6, with and without sound) and the sock-feet (both feet socked, one bare, mid-walk, mid-lose-sock).
   - Show `drum-view` in every field combination, including mid-`sort` and mid-`through`.
   - Stand a 360 px kit person next to a 250 px machine and a standing kit inspector next to the `sock-feet` close-up for scale. Check that the machine and the socks read as the same family as the cat and person in `brand/reference/characters.png`, and that `sock-feet` reads as the same grey figure as the inspector.
3. `node scripts/validate.mjs --ep 0003` must now report 0 errors. Also run `cd video && npx tsc --noEmit`.

## Step 2: Preview for free, before any voice money

1. `node scripts/review-stills.mjs --ep 0003`, then open `advisories/0003-washing-machine/out/review/contact-sheet.png`.
2. Compare it with `preview/contact-sheet.png`: the kit parts should sit where they do there.
3. Fix every shot where something overlaps, crowds the caption zone (y 860–1000) or doesn't match its `desc`. **`desc` is the authority.**
4. Scrub the motion in `cd video && npx remotion studio` → `Advisory-0003`. Check in particular:
   - the matched pairs popping in (S12) and the leftover grey sock (S12b);
   - the fourth "not mine" bubble appearing where there is no door, just as the counter ticks to 4 (S23b);
   - the sock dropping into the bin (S29) and the drawers opening by themselves (S41);
   - the footprints: every second print with sound arcs, in sync across S48–S52;
   - the drum sorting (S61), and a sock slipping through the gap (S62, S75);
   - the slip at L066 (SLIP1, greyscale, `sock-feet` with the left foot bare).

## Step 3: Voice (costs money, about $0.40)

The voice is locked: **MiniMax Speech 2.8 HD, voice `English_ManWithDeepVoice`, through OpenRouter as `minimax/speech-2.8-hd`** (`brand/voice.json → chosen`). Don't run a voice test, and don't change the model.

```sh
node scripts/tts.mjs --ep 0003          # one request per line; the budget guard caps spend at $2
node scripts/stt-check.mjs --ep 0003    # WER check, re-generates bad lines, trims silence, slip treatment on L066
node scripts/timings.mjs --ep 0003      # real timings; runtime must land in 4:45–5:30 (estimate: 4:51)
```

- On Node 22 behind a proxy, prefix the commands with `NODE_USE_ENV_PROXY=1`.
- The estimate is near the bottom of the window. If the real runtime falls outside 4:45–5:30, `timings.mjs` scales all pauses automatically toward 5:00 (it prints the factor). Don't add or cut lines; report the factor.

## Step 4: Review

1. Run `node scripts/review-stills.mjs --ep 0003` again and look at the contact sheet.
2. Watch the whole video once in Studio with sound.
3. Fix layout in `scenes.json`. Once the voice exists, timing-safe corrections can also go in `video/src/episodes/0003-washing-machine/patches.ts`. Never change line text.

## Step 5: Render and master

```sh
cd video && npx remotion render Advisory-0003 ../advisories/0003-washing-machine/out/advisory-0003-washing-machine.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=320k
cd ../advisories/0003-washing-machine/out && ffmpeg -i advisory-0003-washing-machine.mp4 \
  -af "loudnorm=I=-14:TP=-2.0:LRA=11,aresample=48000" \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart advisory-0003-washing-machine-final.mp4
```

- **Targets:** −14 LUFS integrated and at most −1.0 dBTP. Check with `ffmpeg -i …-final.mp4 -af ebur128=peak=true -f null -`.
- **If a stamp transient peaks:** ride its clip gain down 2 dB, as in Advisory 0001.
- **Small container:** add `--concurrency=1`. If Chrome can't be downloaded, pass `--browser-executable=<chrome-headless-shell>`.

## Step 6: Thumbnail

Edit `video/src/episodes/0003-washing-machine/Thumbnail.tsx` (1280×720, `brand/BRAND.md` §7). Reuse this episode's `washing-machine` and `sock` components and the kit's `InspectorBody`.

- **Scene:** the washing machine on the right, large, door open, its drum dark. On the floor in front of it, slightly apart from a small pile of washing, the grey wool sock, lit a little brighter than anything else. Behind the machine, at its left edge, the inspector silhouette at 20% opacity.
- **Text:** `NOT YOURS` in the display font, 150 px, `NOT` in `C.red` and `YOURS` in `C.fg`, with a red underline. Above it, `ADVISORY 0003` small in blue mono.
- **Finish:** a vignette stronger than in the video.

Then render it:

```sh
cd video && npx remotion still Thumbnail-0003 ../advisories/0003-washing-machine/out/thumbnail.png
```

## Step 7: Chapters and metadata

`node scripts/chapters.mjs --ep 0003` fills the CHAPTERS block in `metadata.md` from the real timings. Check that the first chapter is 0:00.

## Step 8: Report

Write `advisories/0003-washing-machine/reports/report.md` covering:
- final runtime and the pause scale factor
- lines regenerated after the STT check
- loudness and true peak
- OpenRouter cost (from `reports/tts-log.json` and the budget)
- every deviation from `scenes.json`, `assets-spec.md` or `brand/BRAND.md`, and why
- the output file paths

## Step 9: Commit

- **Before committing:** run `npx tsc --noEmit`, then `node scripts/validate.mjs --ep 0003` and `--ep 0001`. Run `node scripts/check-reference.mjs` too; it must still pass, because you didn't touch the kit.
- **What to commit:** everything except the gitignored files (the MP4s and regenerable WAVs). The trimmed line WAVs in `video/public/episodes/0003-washing-machine/lines/` **are** committed.
- **Where:** commit on `advisory/0003-washing-machine`. Push and open a pull request only when the owner asks.

## Done when

- [ ] `Advisory-0003` renders 4:45–5:30 at 1920×1080, 30 fps. The final MP4 is at −14 LUFS and ≤ −1.0 dBTP.
- [ ] Every shot matches its `desc`, nothing enters the caption zone, and all eight episode elements and `drum-view` follow `assets-spec.md`.
- [ ] The inspector is only a faint hint (S36, S52) until S74. In S74 it is clearly visible. The `sock-feet` close-ups appear only in the slip and the addendum.
- [ ] The slip (L066 → L068) has the grey frame, the slip transition and the post treatment on L066.
- [ ] Every caption emphasis shows, and validate reports 0 errors.
- [ ] `out/thumbnail.png`, the filled-in `metadata.md` and `reports/report.md` exist.
- [ ] Advisory 0001 still renders, and `check-reference.mjs` passes.

## Do not

- Change any `voice` or `caption` text, the voice model or the directive titles.
- Redraw or restyle kit characters (person, inspector) or kit props. Use them as they are; `sock-feet` is a separate close-up asset, not a change to the inspector.
- Edit kit files for this episode. If something truly belongs in the kit, note it in the report instead.
- Print, log or commit `OPENROUTER_API_KEY`.
