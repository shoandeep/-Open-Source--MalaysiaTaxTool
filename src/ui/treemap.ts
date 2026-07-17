/**
 * Squarified treemap layout (Bruls, Huizing & van Wijk) — pure geometry, no DOM.
 * Feeds the "spending map": each place's tile area is proportional to its spend.
 *
 * `values` must be sorted descending (the algorithm's aspect-ratio guarantee
 * depends on it); the returned rects are index-aligned with the input.
 * Zero/negative values yield zero-size rects at (0,0) rather than being dropped,
 * so callers can keep stable indices.
 */
export interface TreemapRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function treemapLayout(values: number[], width: number, height: number): TreemapRect[] {
  const n = values.length;
  const out: TreemapRect[] = values.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  const total = values.reduce((s, v) => s + Math.max(0, v), 0);
  if (n === 0 || total <= 0 || width <= 0 || height <= 0) return out;

  const scale = (width * height) / total;
  // Positive-area items only; zero-size rects stay at their defaults.
  const items = values
    .map((v, i) => ({ area: Math.max(0, v) * scale, i }))
    .filter((it) => it.area > 0);

  // Remaining free rectangle.
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;

  /** Worst aspect ratio if `row` (areas summing to `sum`) is laid along `side`. */
  const worst = (row: { area: number }[], sum: number, side: number): number => {
    let max = 0;
    let min = Infinity;
    for (const r of row) {
      if (r.area > max) max = r.area;
      if (r.area < min) min = r.area;
    }
    const s2 = sum * sum;
    const side2 = side * side;
    return Math.max((side2 * max) / s2, s2 / (side2 * min));
  };

  /** Commit `row` into the free rect, slicing off a strip along the short side. */
  const layoutRow = (row: { area: number; i: number }[], sum: number) => {
    const vertical = w < h; // lay the strip across the full short side
    const side = vertical ? w : h;
    const thickness = sum / side;
    let along = vertical ? x : y;
    for (const r of row) {
      const len = r.area / thickness;
      out[r.i] = vertical
        ? { x: along, y, w: len, h: thickness }
        : { x, y: along, w: thickness, h: len };
      along += len;
    }
    if (vertical) {
      y += thickness;
      h -= thickness;
    } else {
      x += thickness;
      w -= thickness;
    }
  };

  let row: { area: number; i: number }[] = [];
  let rowSum = 0;
  for (const it of items) {
    const side = Math.min(w, h);
    if (
      row.length === 0 ||
      worst([...row, it], rowSum + it.area, side) <= worst(row, rowSum, side)
    ) {
      row.push(it);
      rowSum += it.area;
    } else {
      layoutRow(row, rowSum);
      row = [it];
      rowSum = it.area;
    }
  }
  if (row.length > 0) layoutRow(row, rowSum);
  return out;
}
