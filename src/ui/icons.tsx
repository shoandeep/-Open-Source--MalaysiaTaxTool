/**
 * Simple line icons (stroke = currentColor) for navigation and feature lists.
 * Replaces the earlier abstract glyphs (◎ ₪ ▤ ◆ ◷ ▦) that communicated little
 * at 11px — and ₪ (the shekel sign) was a genuine oddity for a Malaysian app.
 */

function Svg({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <path d="M3 10.8 12 3l9 7.8" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M10 21v-5h4v5" />
    </Svg>
  );
}

/** Banknote — salary / pay. */
export function SalaryIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </Svg>
  );
}

/** Pie chart — budget split. */
export function BudgetIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <path d="M21.2 15.9A10 10 0 1 1 8.1 2.8" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </Svg>
  );
}

/** Coin stack — savings. */
export function SaveIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" />
      <path d="M4.5 11.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" />
    </Svg>
  );
}

/** Receipt — expenses. */
export function ExpensesIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <path d="M6.5 2.5h11V21l-2.2-1.6L13 21l-2.2-1.6L8.7 21l-2.2-1.6z" />
      <path d="M9.5 7.5h5M9.5 11h5" />
    </Svg>
  );
}

export function CalendarIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <rect x="3.5" y="4.5" width="17" height="16.5" rx="2" />
      <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" />
    </Svg>
  );
}

/** Flag with goal marker — goals / emergency fund. */
export function GoalIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <path d="M5.5 21V3.5" />
      <path d="M5.5 4h12l-2.5 3.5L17.5 11h-12" />
    </Svg>
  );
}

/** Rising line — daily budget momentum. */
export function TrendIcon({ size }: { size?: number }) {
  return (
    <Svg {...(size ? { size } : {})}>
      <path d="M3 17.5 9.5 11l3.7 3.7L21 6.5" />
      <path d="M15.5 6.5H21V12" />
    </Svg>
  );
}
