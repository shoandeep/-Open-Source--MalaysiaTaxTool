import { describe, expect, it } from 'vitest';
import { treemapLayout, type TreemapRect } from './treemap';

const area = (r: TreemapRect) => r.w * r.h;

function overlaps(a: TreemapRect, b: TreemapRect): boolean {
  const eps = 1e-9;
  return a.x < b.x + b.w - eps && b.x < a.x + a.w - eps && a.y < b.y + b.h - eps && b.y < a.y + a.h - eps;
}

describe('treemapLayout', () => {
  it('returns empty for no values', () => {
    expect(treemapLayout([], 100, 60)).toEqual([]);
  });

  it('gives a single value the whole rectangle', () => {
    expect(treemapLayout([42], 100, 60)).toEqual([{ x: 0, y: 0, w: 100, h: 60 }]);
  });

  it('splits two equal values into halves', () => {
    const [a, b] = treemapLayout([5, 5], 100, 60);
    expect(area(a!)).toBeCloseTo(3000);
    expect(area(b!)).toBeCloseTo(3000);
    expect(overlaps(a!, b!)).toBe(false);
  });

  it('preserves proportional areas, stays in bounds, never overlaps (paper example)', () => {
    const values = [6, 6, 4, 3, 2, 2, 1]; // classic squarify example, 6x4 canvas
    const rects = treemapLayout(values, 6, 4);
    const total = values.reduce((s, v) => s + v, 0);
    rects.forEach((r, i) => {
      expect(area(r)).toBeCloseTo((values[i]! / total) * 24, 6);
      expect(r.x).toBeGreaterThanOrEqual(-1e-9);
      expect(r.y).toBeGreaterThanOrEqual(-1e-9);
      expect(r.x + r.w).toBeLessThanOrEqual(6 + 1e-9);
      expect(r.y + r.h).toBeLessThanOrEqual(4 + 1e-9);
    });
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++)
        expect(overlaps(rects[i]!, rects[j]!)).toBe(false);
  });

  it('keeps aspect ratios reasonable for descending input', () => {
    const rects = treemapLayout([90, 55, 34, 21, 13, 8, 5, 3, 2, 1], 100, 62);
    for (const r of rects) {
      const ratio = Math.max(r.w / r.h, r.h / r.w);
      expect(ratio).toBeLessThan(4.5); // squarified keeps tiles chunky, not sliver-y
    }
  });

  it('zero and negative values get zero-size rects without disturbing the rest', () => {
    const rects = treemapLayout([10, 0, 5, -3], 100, 60);
    expect(area(rects[1]!)).toBe(0);
    expect(area(rects[3]!)).toBe(0);
    expect(area(rects[0]!)).toBeCloseTo(4000);
    expect(area(rects[2]!)).toBeCloseTo(2000);
  });

  it('degenerate inputs return all-zero rects', () => {
    expect(treemapLayout([0, 0], 100, 60).every((r) => area(r) === 0)).toBe(true);
    expect(treemapLayout([1, 2], 0, 60).every((r) => area(r) === 0)).toBe(true);
  });
});
