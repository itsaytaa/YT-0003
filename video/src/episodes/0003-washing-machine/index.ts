// Advisory 0003: "If Your Washing Machine Ever Gives Back One Extra Sock… DO NOT WEAR IT".
// Content lives in advisories/0003-washing-machine/; this file only wires it into the kit.
import { createEpisode } from "../../engine";
import scenes from "../../../../advisories/0003-washing-machine/scenes.json";
import timings from "../../../../advisories/0003-washing-machine/timings.json";
import { patches } from "./patches";
import { Thumbnail } from "./Thumbnail";
import { assets } from "./assets";

export const episode = createEpisode({ id: "0003", slug: "0003-washing-machine", scenes, timings, patches, assets });
export { Thumbnail };
