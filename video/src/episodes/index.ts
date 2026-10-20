// Registry of advisories. `node scripts/new-advisory.mjs <NNNN> <topic>` adds new ones
// here automatically. Root.tsx registers Advisory-<id> and Thumbnail-<id>.
import type React from "react";
import type { Episode } from "../engine";
import * as ep0001 from "./0001-cat-corner";
import * as ep0003 from "./0003-washing-machine";

export type EpisodeEntry = { episode: Episode; Thumbnail: React.FC };

export const EPISODES: Record<string, EpisodeEntry> = {
  "0001": { episode: ep0001.episode, Thumbnail: ep0001.Thumbnail },
  "0003": { episode: ep0003.episode, Thumbnail: ep0003.Thumbnail },
};

export function getEpisode(id: string): Episode {
  const e = EPISODES[id];
  if (!e) throw new Error(`Unknown advisory ${id}. Registered: ${Object.keys(EPISODES).join(", ")}`);
  return e.episode;
}
