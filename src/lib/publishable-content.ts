import fs from "fs";
import path from "path";

export interface CitationPointer {
  entityType: string;
  entityId: string;
}

export interface PublishableTeaching {
  id: string;
}

export interface PublishableMediaAsset {
  id: string;
  type: string | null;
  storagePath: string | null;
  sourceUrl: string | null;
  altText: string | null;
  attribution: string | null;
  license: string | null;
}

export interface PublishedImageAsset extends PublishableMediaAsset {
  src: string;
}

function normalizeMediaUrl(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function resolveLocalStoragePath(storagePath: string | null): string | null {
  const normalized = normalizeMediaUrl(storagePath);
  if (!normalized) return null;

  const publicPath = path.join(process.cwd(), "public", normalized.replace(/^\/+/, ""));
  return fs.existsSync(publicPath) ? normalized : null;
}

export function buildCitationKeySet(rows: CitationPointer[]): Set<string> {
  return new Set(rows.map((row) => `${row.entityType}:${row.entityId}`));
}

export function hasItemCitation(
  citationKeys: Set<string>,
  entityType: string,
  entityId: string
): boolean {
  return citationKeys.has(`${entityType}:${entityId}`);
}

export function isPublishedBiography(
  biographyId: string | null | undefined,
  citationKeys: Set<string>
): boolean {
  if (!biographyId) return false;
  return hasItemCitation(citationKeys, "master_biography", biographyId);
}

export function isPublishedTeaching(
  teaching: PublishableTeaching,
  citationKeys: Set<string>
): boolean {
  return hasItemCitation(citationKeys, "teaching", teaching.id);
}

export function resolveMediaAssetUrl(asset: PublishableMediaAsset): string | null {
  const localStoragePath = resolveLocalStoragePath(asset.storagePath);
  if (localStoragePath) return localStoragePath;

  if (normalizeMediaUrl(asset.storagePath)) {
    return null;
  }

  return normalizeMediaUrl(asset.sourceUrl);
}

export function isPublishedImageAsset(
  asset: PublishableMediaAsset,
  citationKeys: Set<string>
): boolean {
  if (asset.type !== "image") return false;
  if (!hasItemCitation(citationKeys, "media_asset", asset.id)) return false;
  return Boolean(resolveMediaAssetUrl(asset));
}

export function getPublishedImageAsset(
  assets: PublishableMediaAsset[],
  citationKeys: Set<string>
): PublishedImageAsset | null {
  for (const asset of assets) {
    if (!isPublishedImageAsset(asset, citationKeys)) continue;
    const src = resolveMediaAssetUrl(asset);
    if (!src) continue;

    return {
      ...asset,
      src,
    };
  }

  return null;
}
