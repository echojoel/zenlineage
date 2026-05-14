import { describe, it, expect } from "vitest";
import { classifyUrl, PROMOTIONAL_DENY, SOURCE_DOMAINS } from "@/lib/source-domains";

describe("classifyUrl", () => {
  it("classifies Sōtōshū global site as institutional", () => {
    const r = classifyUrl("https://global.sotozen-net.or.jp/eng/library/lineage.html");
    expect(r.class).toBe("institutional");
    expect(r.publisher).toBe("Sōtōshū Shūmuchō (Soto Zen Buddhism)");
  });

  it("classifies White Plum Asanga site as institutional", () => {
    const r = classifyUrl("https://whiteplum.org/lineage/glassman");
    expect(r.class).toBe("institutional");
  });

  it("classifies Wikipedia as reference", () => {
    const r = classifyUrl("https://en.wikipedia.org/wiki/Dogen");
    expect(r.class).toBe("reference");
  });

  it("classifies an unknown domain as unknown", () => {
    const r = classifyUrl("https://random-blog.example.com/post");
    expect(r.class).toBe("unknown");
    expect(r.publisher).toBeNull();
  });

  it("flags Amazon product pages as promotional", () => {
    const r = classifyUrl("https://www.amazon.com/dp/B0123456");
    expect(r.class).toBe("promotional");
  });

  it("flags Goodreads as promotional", () => {
    const r = classifyUrl("https://www.goodreads.com/book/show/12345");
    expect(r.class).toBe("promotional");
  });

  it("flags /buy and /shop path segments as promotional", () => {
    expect(classifyUrl("https://publisher.example.com/buy/dogen").class).toBe("promotional");
    expect(classifyUrl("https://store.example.com/shop/zen-books").class).toBe("promotional");
  });

  it("has at least 20 entries in the allow-list", () => {
    expect(SOURCE_DOMAINS.length).toBeGreaterThan(20);
  });

  it("PROMOTIONAL_DENY patterns are RegExp objects", () => {
    for (const p of PROMOTIONAL_DENY) {
      expect(p).toBeInstanceOf(RegExp);
    }
  });

  it("deny-list overrides allow-list for the same URL", () => {
    // shambhala.com is allow-listed as academic, but its /buy path
    // must be treated as promotional, not academic.
    const r = classifyUrl("https://shambhala.com/buy/some-book");
    expect(r.class).toBe("promotional");
  });

  it("does not classify non-subdomain prefixes as the allow-listed domain", () => {
    // "notmro.org" must NOT be treated as institutional just because it
    // ends with "mro.org".
    expect(classifyUrl("https://notmro.org/about").class).toBe("unknown");
    expect(classifyUrl("https://faux-sfzc.org/page").class).toBe("unknown");
  });

  it("flags Substack /p/ posts as promotional", () => {
    expect(classifyUrl("https://someone.substack.com/p/zen-post").class).toBe("promotional");
  });
});
