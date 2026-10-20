// Advisory 0003: episode-specific assets, registered under the names declared in
// scenes.json meta.customElements / meta.customShots. Spec and look:
// advisories/0003-washing-machine/assets-spec.md and brand/BRAND.md §5.
//
//   figures (solid fg/grey + glow): washing-machine (machine.tsx), sock (sock.tsx)
//   set dressing (outline-on-surface): sock-pile, sock-basket, bin, drawers (household.tsx)
//   annotation-like: steps (steps.tsx) · inspector close-up: sock-feet (feet.tsx)
//   shot type: drum-view (drum.tsx)
//
// Likely to be promoted into the kit if a later advisory needs them (BRAND.md §6):
// washing-machine, sock, drawers, bin, steps. sock-feet stays an episode asset.
import type { EpisodeAssets } from "../../episode-context";
import { WashingMachine } from "./machine";
import { Sock } from "./sock";
import { SockPile, SockBasket, Bin, Drawers } from "./household";
import { Steps } from "./steps";
import { SockFeet } from "./feet";
import { DrumView } from "./drum";

export const assets: EpisodeAssets = {
  elements: {
    "washing-machine": WashingMachine,
    "sock": Sock,
    "sock-pile": SockPile,
    "sock-basket": SockBasket,
    "bin": Bin,
    "drawers": Drawers,
    "steps": Steps,
    "sock-feet": SockFeet,
  },
  shots: {
    "drum-view": DrumView,
  },
};
