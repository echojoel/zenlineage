import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseHtml } from '../scripts/extract-terebess';
import type { RawMaster } from '../scripts/scraper-types';

const FIXTURE_PATH = path.resolve(__dirname, 'fixtures/terebess-sample.html');
const GOLDEN_PATH = path.resolve(__dirname, 'golden/terebess-expected.json');

describe('Terebess Zen lineage scraper', () => {
  const html = fs.readFileSync(FIXTURE_PATH, 'utf-8');
  const expected: RawMaster[] = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf-8'));
  const actual = parseHtml(html, 'src_terebess', 'test-run-id');

  it('should extract the correct number of masters', () => {
    expect(actual).toHaveLength(expected.length);
  });

  it('should match the golden output exactly', () => {
    expect(actual).toEqual(expected);
  });

  it('should set source_id to src_terebess on every record', () => {
    for (const m of actual) {
      expect(m.source_id).toBe('src_terebess');
    }
  });

  it('should parse root-level masters with no teacher (no arrow, no indent)', () => {
    const dongshan = actual.find(m => m.name === 'Dongshan Liangjie');
    expect(dongshan).toBeDefined();
    expect(dongshan!.teachers).toHaveLength(0);
  });

  it('should derive teacher from indentation and arrow markers', () => {
    const caoshan = actual.find(m => m.name === 'Caoshan Benji');
    expect(caoshan).toBeDefined();
    expect(caoshan!.teachers).toHaveLength(1);
    expect(caoshan!.teachers[0]!.name).toBe('Dongshan Liangjie');
  });

  it('should handle multi-level indentation', () => {
    const nanyin = actual.find(m => m.name === 'Nanyin Shourou');
    expect(nanyin).toBeDefined();
    expect(nanyin!.teachers).toHaveLength(1);
    expect(nanyin!.teachers[0]!.name).toBe('Xinghua Cunjiang');
  });

  it('should extract school from heading', () => {
    const dongshan = actual.find(m => m.name === 'Dongshan Liangjie');
    expect(dongshan!.school).toBe('Caodong/Soto');

    const linji = actual.find(m => m.name === 'Linji Yixuan');
    expect(linji!.school).toBe('Linji/Rinzai');
  });

  it('should extract CJK and dates from parenthetical', () => {
    const caoshan = actual.find(m => m.name === 'Caoshan Benji');
    expect(caoshan!.names_cjk).toBe('曹山本寂');
    expect(caoshan!.dates).toBe('840-901');
  });

  it('should handle death-only dates', () => {
    const yunju = actual.find(m => m.name === 'Yunju Daoying');
    expect(yunju!.dates).toBe('d. 902');
  });

  it('should return empty array for empty HTML', () => {
    const result = parseHtml('<html><body></body></html>', 'src_terebess', 'run1');
    expect(result).toEqual([]);
  });
});
