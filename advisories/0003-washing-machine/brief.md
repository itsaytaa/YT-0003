# Brief: Advisory 0003

## The video

**Title:** If Your Washing Machine Ever Gives Back One Extra Sock… DO NOT WEAR IT
**Format:** "rules horror" instruction tape, 16:9, about 5 minutes, English.
**One-line pitch:** You empty the washing machine, match every pair, and one sock is left over: grey, wool, slightly too long, and nobody's. The Department explains six directives. In the end you learn that its inspectors walk through your home in grey wool socks, that a sock left behind means they have to come back, and that your machine has quietly sent every one of them back for nine years, losing 206 of your socks along the way.

Channel identity, layout and characters are fixed: see `brand/BRAND.md`. The voice is locked: MiniMax Speech 2.8 HD, voice `English_ManWithDeepVoice`, through OpenRouter as `minimax/speech-2.8-hd`. It ignores tone instructions, so the delivery is written into the text (short sentences, "..." for held pauses).

## Story logic

1. **The hook.** Every washing machine eats socks, one at a time, never a pair. Tonight yours gave one back. You matched every pair and one was left: grey, wool, slightly too long. Nobody in your household owns a sock like it.
2. **Directive 1: Do not wear it.** It is warm, though it came out of a cold wash. It looks about your size. It is not your size: it has been worn, and a worn sock keeps the shape of the foot inside it. Someone will come back for it, and it should not be on your foot when they do.
3. **Directive 2: Do not ask whose it is.** You hold it up in the hallway and ask. Everyone says "not mine". Count the answers. In the Department's files, 412 households asked, and every one got one answer too many. Do not ask again.
4. **Directive 3: Do not throw it away** (the one most households violate). Case 0927 (Cardiff): she threw it out on Wednesday, the bin was collected on Thursday, and on Friday the sock was back in her machine. Folded. Nobody in her household folds socks. *"We know who folded it. We will not be putting that in writing."*
5. **Directive 4: Leave it on the machine.** Not in a drawer, not by your bed: if it is in a drawer, they will open every drawer. Put it on top of the washing machine, smooth it flat, leave the laundry-room door open and go to bed. It is easier for everyone if they don't have to look.
6. **Directive 5: Do not count the steps.** Tonight the house is very quiet. Someone is walking through your home on one sock. One foot makes no sound; the other one does. You will hear every second step: past your door, to the laundry room. They stop at the machine. **Slip:** *"Our left foot gets cold."* → *"Apologies. That remark has been redacted."* (slip line L066)
7. **Directive 6: Do not blame the machine.** The emotional turn. In the morning the sock is gone. You run a wash, and one of your socks goes missing again. Nine years, 206 socks. You called it the machine that eats socks. It was sorting: in the dark, in the drum, yours from theirs. When it wasn't sure, it sent yours away. It would rather lose your sock than leave you one of theirs. Tonight it got one wrong; it's old now. Let it keep the next one.
8. **Addendum.** Department inspectors don't wear shoes indoors (you would hear them). They walk in grey wool socks, slightly too long. Inspections are long, and sometimes a sock comes off. A sock left behind means the inspection is not finished, and the inspector has to come back for it. *"The Department of Unlisted Risks has issued wool socks for ninety-one years."* Your machine has sent back every one they left in your home, through the gap behind the drum, until tonight. In nine years they never had a reason to come back. That is why it is listed as a risk.
9. **Callback.** If your machine gives back a sock tonight that is not yours, it is not a mistake. Leave it on the machine. Stay in bed. And do not wear it.

**Continuity with Advisories 0001 and 0002:** the same Department, the same faceless grey **inspector** (still hat, coat, clipboard; this episode only adds what is on its feet, in a close-up asset), the same reveal shape (a household thing has been quietly protecting you, and that is why the Department lists it as a risk). In 0001 the inspectors stood in corners; in 0002 we learned where they wait; here we learn why you never hear them.

## Directives

| # | Title | Escalation |
|---|---|---|
| 1 | Do not wear it | It already has the shape of someone's foot; they will come for it |
| 2 | Do not ask whose it is | One answer too many (412 households) |
| 3 | Do not throw it away | It comes back to the machine, folded (case 0927) |
| 4 | Leave it on the machine | Otherwise they will open every drawer |
| 5 | Do not count the steps | Every second step; the slip |
| 6 | Do not blame the machine | Nine years of sorting; 206 lost socks |

## Assets

- **Kit characters used:** person ("you"), inspector (hinted at 7–8% opacity until the addendum reveal in S74), crowd (none), cat (none).
- **Kit props used:** bed, door, window, clock, label, mark, speech, boundary, glow, doc, case-file, counter (`decor: folder-stack`, `dots-grid`), calendar (`fromYear`/`toYear`/`pageLabel`), seal, cards, doc-mini, thought.
- **New episode assets** (spec in `assets-spec.md`; declared in `scenes.json → meta`):
  - elements: `washing-machine`, `sock`, `sock-pile`, `sock-basket`, `bin`, `drawers`, `steps`, `sock-feet`
  - shot type: `drum-view` (full-frame close-up through the machine's door glass, including the gap behind the drum)
- **Promotion check:** `robot-vacuum`, `phone`, `wall` from Advisory 0002 are not needed here, so nothing is promoted into the kit for this episode.

## End card

Status word: **RETURNED.** + "NEXT ADVISORY: 0004".
