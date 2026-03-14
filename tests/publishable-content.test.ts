import { describe, expect, it } from "vitest";
import {
  buildCitationKeySet,
  getPublishedImageAsset,
  isPublishedBiography,
  isPublishedImageAsset,
  isPublishedTeaching,
  resolveMediaAssetUrl,
} from "@/lib/publishable-content";

describe("publishable content helpers", () => {
  it("builds citation lookup keys", () => {
    const keys = buildCitationKeySet([
      { entityType: "master_biography", entityId: "bio_1" },
      { entityType: "teaching", entityId: "teaching_1" },
    ]);

    expect(keys.has("master_biography:bio_1")).toBe(true);
    expect(keys.has("teaching:teaching_1")).toBe(true);
  });

  it("requires item-level citations for published biographies", () => {
    const keys = buildCitationKeySet([
      { entityType: "master_biography", entityId: "bio_1" },
    ]);

    expect(isPublishedBiography("bio_1", keys)).toBe(true);
    expect(isPublishedBiography("bio_2", keys)).toBe(false);
    expect(isPublishedBiography(null, keys)).toBe(false);
  });

  it("requires item-level citations for published teachings", () => {
    const keys = buildCitationKeySet([
      { entityType: "teaching", entityId: "teaching_1" },
    ]);

    expect(isPublishedTeaching({ id: "teaching_1" }, keys)).toBe(true);
    expect(isPublishedTeaching({ id: "teaching_2" }, keys)).toBe(false);
  });

  it("prefers storage paths when resolving media URLs", () => {
    expect(
      resolveMediaAssetUrl({
        id: "asset_1",
        type: "image",
        storagePath: " /media/hakuin.jpg ",
        sourceUrl: "https://example.com/hakuin.jpg",
        altText: null,
        attribution: null,
        license: null,
      }),
    ).toBe("/media/hakuin.jpg");
  });

  it("requires citations and a URL for published images", () => {
    const keys = buildCitationKeySet([
      { entityType: "media_asset", entityId: "asset_1" },
    ]);

    expect(
      isPublishedImageAsset(
        {
          id: "asset_1",
          type: "image",
          storagePath: null,
          sourceUrl: "https://example.com/hakuin.jpg",
          altText: "Hakuin portrait",
          attribution: "Example Archive",
          license: "CC BY-SA 4.0",
        },
        keys,
      ),
    ).toBe(true);

    expect(
      isPublishedImageAsset(
        {
          id: "asset_2",
          type: "image",
          storagePath: null,
          sourceUrl: "https://example.com/other.jpg",
          altText: null,
          attribution: null,
          license: null,
        },
        keys,
      ),
    ).toBe(false);
  });

  it("selects the first publishable image asset", () => {
    const keys = buildCitationKeySet([
      { entityType: "media_asset", entityId: "asset_2" },
    ]);

    const published = getPublishedImageAsset(
      [
        {
          id: "asset_1",
          type: "image",
          storagePath: null,
          sourceUrl: "https://example.com/unpublished.jpg",
          altText: null,
          attribution: null,
          license: null,
        },
        {
          id: "asset_2",
          type: "image",
          storagePath: "/media/published.jpg",
          sourceUrl: "https://example.com/published.jpg",
          altText: "Published image",
          attribution: "Example Archive",
          license: "Public domain",
        },
      ],
      keys,
    );

    expect(published?.id).toBe("asset_2");
    expect(published?.src).toBe("/media/published.jpg");
  });
});
