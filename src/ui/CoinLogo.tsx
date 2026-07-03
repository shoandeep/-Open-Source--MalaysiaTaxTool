import { useId } from 'react';

interface CoinLogoProps {
  size?: number;
  detail?: 'full' | 'mark';
}

const ENGRAVE = '#8a6a22';
const TAU = Math.PI * 2;

/**
 * Malaysian 50-sen coin (third series, nickel-brass) as an inline SVG.
 * Art direction mirrors the canvas texture in Hero3D.tsx (`makeCoinTexture`):
 * radial struck-metal field lit from the top-left, smooth raised rim + inner
 * ring, diagonal sheen, embossed engravings in dark bronze with a light
 * top-left edge and dark bottom-right edge so they read as raised metal.
 *
 * detail="full"  — everything: "50 / SEN", hibiscus, "BANK NEGARA MALAYSIA"
 *                  arc, year 2012, reeded-edge ticks. Use at >=48px.
 * detail="mark"  — simplified for 24–36px: rim, metal, hibiscus hint and a
 *                  dominant "50".
 *
 * Gradient/filter IDs are scoped via useId() so multiple instances per page
 * never collide (duplicate SVG ids break url(#…) references).
 */
export function CoinLogo({ size = 48, detail = 'full' }: CoinLogoProps) {
  const id = `coin${useId().replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Viewport is 100×100; the coin circle is centred at 50,50.
  const cx = 50;
  const cy = 50;
  const R = 47.5; // coin outer radius
  const rimW = 3.5; // rim band width
  const full = detail === 'full';

  // Emboss offsets — proportionally stronger on the small mark so the relief
  // survives being rendered at 24–36px.
  const hl = full ? { dx: -0.4, dy: -0.5 } : { dx: -1, dy: -1.2 };
  const sh = full ? { dx: 0.5, dy: 0.65 } : { dx: 1.2, dy: 1.5 };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Finance Guru"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Metallic gold field — radial, lit from the top-left */}
        <radialGradient id={`${id}_field`} cx="34%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fbe9af" />
          <stop offset="30%" stopColor="#eec656" />
          <stop offset="62%" stopColor="#d4a439" />
          <stop offset="85%" stopColor="#b5851f" />
          <stop offset="100%" stopColor="#9a6a15" />
        </radialGradient>

        {/* Diagonal brushed sheen */}
        <linearGradient id={`${id}_sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#3c2305" stopOpacity="0.14" />
        </linearGradient>

        {/* Raised rim — bright top-left, dark bottom-right */}
        <linearGradient id={`${id}_rim`} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="#fdedb2" />
          <stop offset="45%" stopColor="#e5bd4d" />
          <stop offset="100%" stopColor="#7d5710" />
        </linearGradient>

        {/* Thin inner ring inside the rim */}
        <linearGradient id={`${id}_innerRing`} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="#8a6417" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbe9af" stopOpacity="0.45" />
        </linearGradient>

        {/* Soft drop shadow under the whole coin */}
        <filter id={`${id}_shadow`} x="-10%" y="-10%" width="120%" height="124%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#3c1e00" floodOpacity="0.45" />
        </filter>

        {/* Emboss: dark copy offset down-right + light copy offset up-left,
            both BEHIND the bronze fill -> raised-metal relief. */}
        <filter id={`${id}_emboss`} x="-8%" y="-8%" width="116%" height="116%">
          <feFlood floodColor="#462e08" floodOpacity="0.62" result="dkf" />
          <feComposite in="dkf" in2="SourceGraphic" operator="in" result="dk" />
          <feOffset in="dk" dx={sh.dx} dy={sh.dy} result="dark" />
          <feFlood floodColor="#fff7d4" floodOpacity="0.85" result="ltf" />
          <feComposite in="ltf" in2="SourceGraphic" operator="in" result="lt" />
          <feOffset in="lt" dx={hl.dx} dy={hl.dy} result="light" />
          <feMerge>
            <feMergeNode in="dark" />
            <feMergeNode in="light" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip to the coin face */}
        <clipPath id={`${id}_clip`}>
          <circle cx={cx} cy={cy} r={R - 1} />
        </clipPath>

        {/* Bottom arc for "BANK NEGARA MALAYSIA" — 120° span through 6 o'clock,
            left→right so the glyphs sit upright with tops toward the centre. */}
        {full && (
          <path id={`${id}_arc`} d="M 15.4,70 A 40,40 0 0 0 84.6,70" fill="none" />
        )}
      </defs>

      <g filter={`url(#${id}_shadow)`}>
        {/* Gold field */}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${id}_field)`} />

        {/* Diagonal sheen across the face */}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${id}_sheen)`} />

        {/* Reeded / milled edge — fine tick marks just inside the rim */}
        {full && (
          <g>
            {Array.from({ length: 84 }, (_, i) => {
              const a = (i / 84) * TAU;
              const c = Math.cos(a);
              const s = Math.sin(a);
              return (
                <line
                  key={i}
                  x1={cx + c * (R - 0.4)}
                  y1={cy + s * (R - 0.4)}
                  x2={cx + c * (R - 2.6)}
                  y2={cy + s * (R - 2.6)}
                  stroke="#5a3705"
                  strokeOpacity="0.4"
                  strokeWidth="0.6"
                />
              );
            })}
          </g>
        )}

        {/* Smooth raised rim band */}
        <circle
          cx={cx}
          cy={cy}
          r={R - rimW / 2}
          fill="none"
          stroke={`url(#${id}_rim)`}
          strokeWidth={rimW}
        />

        {/* Inner decorative ring */}
        <circle
          cx={cx}
          cy={cy}
          r={R - rimW - 1.6}
          fill="none"
          stroke={`url(#${id}_innerRing)`}
          strokeWidth="0.8"
        />

        {/* ── Embossed engravings — dark bronze, raised via the emboss filter ── */}
        <g filter={`url(#${id}_emboss)`} clipPath={`url(#${id}_clip)`} fill={ENGRAVE} stroke="none">
          {/* Large "50" right of centre + "SEN" beneath (Hero3D proportions) */}
          <text
            x={full ? 58.5 : 55}
            y={full ? 49.5 : 51.5}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Arial Black', Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize={full ? 34 : 46}
            letterSpacing="-1.5"
          >
            50
          </text>
          {full && (
            <text
              x="59.5"
              y="67.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="700"
              fontSize="9.5"
              letterSpacing="1.2"
            >
              SEN
            </text>
          )}

          {/* Hibiscus (bunga raya), upper-left — Hero3D geometry scaled 512→100.
              Five stroked petals + centre + curved stamen with a tip dot. */}
          <g
            transform={
              full
                ? 'translate(29.3, 39.5) scale(0.2)'
                : 'translate(24, 26) scale(0.155)'
            }
            fill="none"
            stroke={ENGRAVE}
            strokeWidth="5"
            strokeLinejoin="round"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                transform={`rotate(${(i / 5) * 360 - 17.2})`}
                d="M 0 -6 Q -22 -26 -12 -52 Q 0 -66 12 -52 Q 22 -26 0 -6 Z"
              />
            ))}
            <circle cx="0" cy="0" r="7" fill={ENGRAVE} stroke="none" />
            {full && (
              <>
                <path d="M 3 -4 Q 36 -32 54 -60" strokeWidth="4" strokeLinecap="round" />
                <circle cx="56" cy="-62" r="5" fill={ENGRAVE} stroke="none" />
              </>
            )}
          </g>

          {/* Year, top-right */}
          {full && (
            <text
              x="65"
              y="29.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="700"
              fontSize="6"
            >
              2012
            </text>
          )}

          {/* "BANK NEGARA MALAYSIA" arced along the bottom rim */}
          {full && (
            <text
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="700"
              fontSize="5.2"
              letterSpacing="0.35"
              wordSpacing="1.4"
            >
              <textPath href={`#${id}_arc`} startOffset="50%" textAnchor="middle">
                BANK NEGARA MALAYSIA
              </textPath>
            </text>
          )}
        </g>
      </g>
    </svg>
  );
}
