import { useMemo, useState } from 'react';
import { formatSen, type Sen } from '../money/money';
import { CHART_COLORS } from './charts';
import { treemapLayout } from './treemap';

/**
 * The "spending map" — a squarified treemap of where money went this month.
 * Each place (free-text vendor tag, aggregated on-device) is a tile whose area
 * is proportional to its spend. Purely local: no map tiles, no geolocation,
 * so the strict CSP holds. Tap a tile for the exact numbers.
 */
export interface PlaceSpend {
  place: string;
  totalSen: Sen;
  count: number;
}

const MAX_TILES = 9;

/** Fold everything beyond the top tiles into one aggregate tile. */
function foldPlaces(places: PlaceSpend[]): (PlaceSpend & { other?: boolean })[] {
  if (places.length <= MAX_TILES) return places;
  const head = places.slice(0, MAX_TILES - 1);
  const rest = places.slice(MAX_TILES - 1);
  return [
    ...head,
    {
      place: `${rest.length} other places`,
      totalSen: rest.reduce((s, p) => s + p.totalSen, 0),
      count: rest.reduce((s, p) => s + p.count, 0),
      other: true,
    },
  ];
}

export function SpendingMap({
  places,
  monthTotalSen,
  compact = false,
}: {
  places: PlaceSpend[]; // sorted largest-first (spendByPlace already does)
  monthTotalSen: Sen; // whole month's spend, for the share-of-month detail
  compact?: boolean; // dashboard teaser: shorter map, no detail panel
}) {
  const [selected, setSelected] = useState<string | null>(null);

  // Lay out on a 100-unit-wide abstract canvas; height sets the map's shape.
  const H = compact ? 52 : 64;
  const tiles = useMemo(() => {
    const folded = foldPlaces(places);
    const rects = treemapLayout(
      folded.map((p) => p.totalSen),
      100,
      H,
    );
    return folded.map((p, i) => ({ ...p, rect: rects[i]!, color: CHART_COLORS[i % CHART_COLORS.length]! }));
  }, [places, H]);

  if (tiles.length === 0) return null;
  const mappedTotal = tiles.reduce((s, t) => s + t.totalSen, 0);
  const sel = tiles.find((t) => t.place === selected) ?? null;

  return (
    <div>
      <div
        role="group"
        aria-label="Spending map: places sized by amount spent"
        className="relative w-full overflow-hidden rounded-xl bg-surface-2 ring-1 ring-inset ring-line"
        style={{ aspectRatio: `100 / ${H}` }}
      >
        {tiles.map((t, i) => {
          const { rect, color } = t;
          if (rect.w <= 0 || rect.h <= 0) return null;
          const on = selected === t.place;
          // Label density by tile size (% of the abstract canvas).
          const showAmount = rect.w >= 22 && rect.h >= 14;
          const showName = rect.w >= 11 && rect.h >= 7;
          return (
            <button
              key={t.place}
              type="button"
              aria-pressed={on}
              aria-label={`${t.place}: ${formatSen(t.totalSen)} across ${t.count} expense${t.count === 1 ? '' : 's'}`}
              onClick={() => setSelected(on ? null : t.place)}
              className="group absolute p-[1.5px] outline-none"
              style={{
                left: `${rect.x}%`,
                top: `${(rect.y / H) * 100}%`,
                width: `${rect.w}%`,
                height: `${(rect.h / H) * 100}%`,
              }}
            >
              <span
                className={`flex h-full w-full flex-col items-start justify-end overflow-hidden rounded-md px-1.5 py-1 text-left transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring/70 ${
                  on ? 'ring-2 ring-gold brightness-110' : 'hover:brightness-110'
                }`}
                style={{
                  background: `linear-gradient(140deg, ${color}3d, ${color}17)`,
                  boxShadow: `inset 0 0 0 1px ${color}59`,
                  animation: `fade-up 0.5s ${i * 45}ms cubic-bezier(0.22,1,0.36,1) both`,
                }}
              >
                {showName && (
                  <span className="max-w-full truncate text-[11px] font-semibold leading-tight text-ink">
                    {t.place}
                  </span>
                )}
                {showAmount && (
                  <span className="max-w-full truncate font-mono text-[10px] tabular-nums text-ink-soft">
                    {formatSen(t.totalSen, { compact: true })} · ×{t.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {!compact &&
        (sel ? (
          <div className="mt-2 flex items-baseline justify-between gap-2 rounded-lg border border-gold/20 bg-gold/[0.07] px-3 py-2 text-sm animate-fade-up">
            <span className="min-w-0 truncate font-semibold text-ink">📍 {sel.place}</span>
            <span className="shrink-0 text-right text-xs text-ink-soft">
              <span className="font-mono text-sm tabular-nums text-ink">{formatSen(sel.totalSen)}</span>
              {' · '}×{sel.count}
              {monthTotalSen > 0 && <> · {Math.round((sel.totalSen / monthTotalSen) * 100)}% of month</>}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-ink-faint">
            Tiles are sized by spend — {formatSen(mappedTotal)} mapped
            {monthTotalSen > mappedTotal ? ` of ${formatSen(monthTotalSen)} this month` : ''}. Tap a
            tile for details.
          </p>
        ))}
    </div>
  );
}
