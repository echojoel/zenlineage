/**
 * Aggregator for the proverb expansion (issue #15).
 *
 * Each region file exports an array of CuratedProverb objects. This module
 * concatenates them into a single ordered list and re-exports the source
 * list. Adding a new region means adding a new file beside this one and
 * importing it from the array below.
 */

import type { CuratedProverb, CuratedProverbSource } from "../curated-proverbs";
import { EXPANSION_SOURCES } from "./expansion-sources";
import { KOREAN_PROVERBS } from "./expansion-korean";
import { VIETNAMESE_PROVERBS } from "./expansion-vietnamese";
import { CHAN_PROVERBS_PART_1 } from "./expansion-chan-1";
import { CHAN_PROVERBS_PART_2 } from "./expansion-chan-2";
import { CHAN_PROVERBS_PART_3 } from "./expansion-chan-3";
import { JAPANESE_PROVERBS } from "./expansion-japanese";
import { INDIAN_PROVERBS } from "./expansion-indian";
import { MODERN_PROVERBS } from "./expansion-modern";
import { EXTRA_PROVERBS } from "./expansion-extra";

export const EXPANSION_PROVERB_SOURCES: CuratedProverbSource[] = EXPANSION_SOURCES;

export const EXPANSION_PROVERBS: CuratedProverb[] = [
  ...INDIAN_PROVERBS,
  ...CHAN_PROVERBS_PART_1,
  ...CHAN_PROVERBS_PART_2,
  ...CHAN_PROVERBS_PART_3,
  ...JAPANESE_PROVERBS,
  ...KOREAN_PROVERBS,
  ...VIETNAMESE_PROVERBS,
  ...MODERN_PROVERBS,
  ...EXTRA_PROVERBS,
];
