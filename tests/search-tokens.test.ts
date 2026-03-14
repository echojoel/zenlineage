import { describe, it, expect } from 'vitest';
import { generateSearchTokens, stripDiacritics } from '@/lib/search-tokens';

// ---------------------------------------------------------------------------
// Helper: extract just the token strings for easy assertion
// ---------------------------------------------------------------------------
function tokens(value: string, locale = 'en', nameType = 'dharma'): string[] {
  return generateSearchTokens({ value, locale, nameType }).map((t) => t.token);
}

// ---------------------------------------------------------------------------
// stripDiacritics unit tests
// ---------------------------------------------------------------------------
describe('stripDiacritics', () => {
  it('strips macrons', () => {
    expect(stripDiacritics('Dōgen')).toBe('Dogen');
  });

  it('strips umlauts', () => {
    expect(stripDiacritics('Lü')).toBe('Lu');
  });

  it('strips circumflexes', () => {
    expect(stripDiacritics('Thích Nhất Hạnh')).toMatch(/Thich/);
  });

  it('leaves ASCII unchanged', () => {
    expect(stripDiacritics('Bodhidharma')).toBe('Bodhidharma');
  });
});

// ---------------------------------------------------------------------------
// generateSearchTokens
// ---------------------------------------------------------------------------
describe('generateSearchTokens', () => {
  // 1. Simple English name
  it('generates a single token for a simple ASCII name', () => {
    const result = tokens('Bodhidharma');
    expect(result).toContain('bodhidharma');
  });

  // 2. Diacritics stripping
  it('strips diacritics and preserves original', () => {
    const result = generateSearchTokens({
      value: 'Dōgen',
      locale: 'ja',
      nameType: 'dharma',
    });

    const tokenStrings = result.map((t) => t.token);
    expect(tokenStrings).toContain('dogen');

    // Original should preserve the macron
    const dogenToken = result.find((t) => t.token === 'dogen');
    expect(dogenToken?.original).toBe('Dōgen');
  });

  // 3. Chinese characters → pinyin
  it('generates pinyin tokens for Chinese characters', () => {
    const result = tokens('道元', 'zh');
    expect(result).toContain('dao yuan');
    expect(result).toContain('daoyuan');
  });

  // 4. Japanese kana → romaji
  it('generates romaji tokens for Japanese kana', () => {
    const result = tokens('どうげん', 'ja');
    expect(result).toContain('dougen');
  });

  // 5. Mixed CJK + romanised
  it('generates combined tokens for mixed CJK and romanised input', () => {
    const result = generateSearchTokens({
      value: 'Dōgen 道元',
      locale: 'ja',
      nameType: 'dharma',
    });

    const tokenStrings = result.map((t) => t.token);

    // Should have the romanised part (diacritics stripped)
    expect(tokenStrings).toContain('dogen');

    // Should have pinyin for the kanji
    expect(tokenStrings).toContain('dao yuan');
    expect(tokenStrings).toContain('daoyuan');
  });

  // 6. Wade-Giles with hyphens and apostrophes
  it('handles Wade-Giles romanisation with hyphens and apostrophes', () => {
    const result = tokens("T'ien-huang Tao-wu");

    // Normalised with punctuation kept
    expect(result).toContain("t'ien-huang tao-wu");

    // Stripped form (no apostrophes or hyphens)
    expect(result).toContain('tienhuang taowu');
  });

  // 7. Multi-word name
  it('generates full-name and individual word tokens for multi-word names', () => {
    const result = tokens('Nanquan Puyuan', 'zh');
    expect(result).toContain('nanquan puyuan');
    expect(result).toContain('nanquan');
    expect(result).toContain('puyuan');
  });

  // 8. Korean romanised
  it('generates tokens for Korean romanised names', () => {
    const result = tokens('Taego Pou', 'ko');
    expect(result).toContain('taego pou');
    expect(result).toContain('taego');
    expect(result).toContain('pou');
  });

  // ---------------------------------------------------------------------------
  // Additional edge cases
  // ---------------------------------------------------------------------------

  it('returns correct locale on all tokens', () => {
    const result = generateSearchTokens({
      value: '道元',
      locale: 'zh',
      nameType: 'dharma',
    });
    for (const tok of result) {
      expect(tok.locale).toBe('zh');
    }
  });

  it('maps nameType "alias" to tokenType "alias"', () => {
    const result = generateSearchTokens({
      value: 'Shōyō Daishi',
      locale: 'ja',
      nameType: 'alias',
    });
    for (const tok of result) {
      expect(tok.tokenType).toBe('alias');
    }
  });

  it('maps nameType "dharma" to tokenType "name"', () => {
    const result = generateSearchTokens({
      value: 'Bodhidharma',
      locale: 'en',
      nameType: 'dharma',
    });
    for (const tok of result) {
      expect(tok.tokenType).toBe('name');
    }
  });

  it('deduplicates tokens', () => {
    const result = tokens('Test');
    // Should not have duplicate "test" entries
    const testOccurrences = result.filter((t) => t === 'test');
    expect(testOccurrences).toHaveLength(1);
  });

  it('handles katakana input', () => {
    const result = tokens('ドウゲン', 'ja');
    expect(result).toContain('dougen');
  });

  it('handles single Chinese character', () => {
    const result = tokens('禅', 'zh');
    expect(result).toContain('chan');
  });
});
