import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { citations, mediaAssets } from "@/db/schema";
import { buildCitationKeySet, getPublishedImageAsset } from "@/lib/publishable-content";
import { masterThumbPath } from "@/lib/master-thumbs";

/** Small, cited real portraits only; generated name cards are deliberately excluded. */
export async function publishedMasterPortraits(masterIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(masterIds)];
  if (ids.length === 0) return new Map();

  const assets = await db
    .select({
      id: mediaAssets.id,
      entityId: mediaAssets.entityId,
      type: mediaAssets.type,
      storagePath: mediaAssets.storagePath,
      sourceUrl: mediaAssets.sourceUrl,
      altText: mediaAssets.altText,
      attribution: mediaAssets.attribution,
      license: mediaAssets.license,
    })
    .from(mediaAssets)
    .where(and(
      eq(mediaAssets.entityType, "master"),
      eq(mediaAssets.type, "image"),
      inArray(mediaAssets.entityId, ids)
    ));
  if (assets.length === 0) return new Map();

  const cited = await db
    .select({ entityType: citations.entityType, entityId: citations.entityId })
    .from(citations)
    .where(and(eq(citations.entityType, "media_asset"), inArray(citations.entityId, assets.map((a) => a.id))));
  const keys = buildCitationKeySet(cited);
  const byMaster = new Map<string, typeof assets>();
  for (const asset of assets) {
    const group = byMaster.get(asset.entityId) ?? [];
    group.push(asset);
    byMaster.set(asset.entityId, group);
  }

  const portraits = new Map<string, string>();
  for (const [masterId, group] of byMaster) {
    const image = getPublishedImageAsset(group, keys);
    if (image) portraits.set(masterId, masterThumbPath(image.src, 96) ?? image.src);
  }
  return portraits;
}
