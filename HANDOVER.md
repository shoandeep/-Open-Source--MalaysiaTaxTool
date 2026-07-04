# Finance Guru — Handover

_Last updated: 2026-07-02. This is a living handover; update it at the end of each working session._

## What this app is (the end goal)

A **local-first, client-side-only personal finance PWA for Malaysia** that a single user
installs and trusts with their whole money picture — and that is **publishable as a clean,
private-by-design web app**. It should track, end to end:

- **Salary → detailed budget** (Malaysian statutory deductions: EPF / SOCSO / EIS / PCB).
- **Every savings & investment vehicle** used in Malaysia: normal bank savings, **e-wallet
  FD promotions**, **bank FD promotions**, stocks / investing, and other local instruments.
- **Every payment channel**: cash, debit, e-wallet, credit, BNPL — tracked across all fields.
- **Spending by category _and_ by location** (a monthly purchase **map view** is planned).

**North star:** frictionless capture — sub-3-second, decision-free logging for fast-paced /
ADHD users. Prefer fewer taps and smart defaults over configurability.

**Non-negotiable constraints** (see `CLAUDE.md` for the full list): client-side only, no
backend, no network at runtime, strict CSP (no `unsafe-eval`, no remote fonts/scripts/images),
encrypted at rest (AES-GCM-256 / PBKDF2-210k, fail-closed), money always integer sen, escape
all user text, never move real money.

## Current status (2026-07-03)

- Pushed & live: `9c23084` (50-sen coin brand mark) + `c6b8095` (hero visibility fix)
  + `c88d117` (dev CSP tightened to localhost-only WebSockets). Tree green:
  build ok, 161/161 unit, 9/9 Playwright.
- The b840ab8 UX pass cleared both gates earlier (feature-test 8/8; opus audit
  APPROVED — jspdf eval-free, exports injection-safe, CSP holds) and is deployed.
- A hands-on security audit (2026-07-03) found + fixed one Medium (dev meta CSP
  allowed `ws:`/`wss:` to any origin); npm audit 0 vulns; crypto/WebAuthn/exports
  verified sound. Watch item: map view must consider Permissions-Policy
  (geolocation is disabled at the header level in vercel.json).
- **UI/UX review: ALL top-10 findings fixed** (2026-07-05). #1 hero `c6b8095`;
  #3/#4/#6/#7/#9 in "Polish wave 1"; #2/#10 in wave 2 (new `src/ui/icons.tsx`,
  instant landing hero, static coin below md); #5/#8 in wave 3 (Transactions
  list-first with a Filters disclosure; global 5-second undo snackbar
  `src/ui/undo.tsx` wired to every delete, incl. balance re-apply for transfer
  entries). P3 honourable mentions (CostsScreen phrasing, empty-calendar
  guidance, desktop dead space, FAB overlap) remain open — minor.
- Trap to remember: `.silk-panel` is un-layered CSS whose `background:` shorthand
  overrides ANY Tailwind `bg-*` utility on the same element.

## Done this session (the 8 UX changes in `b840ab8`)

1. Home: removed the read-only Emergency fund card (Save screen has the fuller editable one).
2. Home: "Estimated net pay / month" is now a dark teal hero card (light-on-dark).
3. Budget: editable "RM / month" field beside `%` per allocation (back-calculates the pct).
4. Nav rename: **Pay → Salary** (users mistook it for a payment app).
5. Nav rename: **Spend → Expenses**.
6. Expenses: "Log an expense" moved above the charts/records for fast repeat entry.
7. Export: real in-app **PDF** via `jspdf@4.2.1` (lazy-loaded chunk, no eval, built-in fonts,
   no remote fetch); HTML + print kept as fallbacks.
8. Mobile: bottom-nav **safe-area insets** + `viewport-fit=cover` (no edge-touching on iPhone).

## Already implemented (broader app)

Encrypted vault + biometric unlock; installed-PWA launches straight to unlock. Salary/net-pay
with statutory deductions + payslip override. Pay-cycle budgeting, payday-on-calendar with
weekend/Malaysian-public-holiday shifting + state profile. Allocation budget (% and RM). Fixed
costs on the calendar. Cash accounts, investments, savings goals, emergency fund. Quick-add pad
+ Inbox + Web Share Target + home-screen shortcut + auto-logged recurring events. Payment-method
tracking + spend-by-method + amounts owed. Debt tracker (cards/BNPL, repayments). Filterable
Transactions view. Branded HTML + PDF export.

## Roadmap (intended order)

1. ~~Gates for `b840ab8`~~ ✅ done (8/8 feature-test, audit APPROVED, deployed).
2. ~~Realistic 50-sen coin logo~~ ✅ shipped in `9c23084` (`src/ui/CoinLogo.tsx`, pure inline
   SVG + regenerated PWA icons). **Remaining polish: UX findings #2–#10** (see status above) —
   each fixed or justified won't-fix here.
3. **Core-tracking completeness for publishing** — design settled (build as pure logic +
   tests first): `CashAccount` + `startDate/termMonths/maturityDate` for bank FDs (simple
   interest to maturity, integer-sen half-up); e-wallet FD promos via existing
   `promoRatePercent/promoEnds`; `Investment.type` (stocks/unitTrust/ASNB/TabungHaji/robo/
   crypto/EPF/other) + `ratePercent` projection; `Expense.methodAccountId` linking payments
   to specific wallets/cards with last-used-per-method defaults.
4. **Then** the monthly **purchase map view** (spend by location). ⚠️ Open design decision:
   map tiles are remote by default and collide with the strict CSP / no-network rule — resolve
   first (bundled/offline tiles vs. manual location tagging vs. a documented CSP exception)
   before building; also revisit Permissions-Policy (geolocation currently disabled).

## Key files (see `CLAUDE.md` for the full map)

- `src/money/money.ts` — the only place money is formatted/parsed (integer sen).
- `src/model/types.ts`, `src/model/defaults.ts` — model + safe migration (`normalizeAppData`).
- `src/budget/` — pure, unit-tested logic. `src/state/selectors.ts` — `deriveFinances` view-model.
- `src/ui/AppShell.tsx` — nav/tabs. `src/ui/screens/` — the six screens. `src/export/pdf.ts` — PDF.

## Commands

- `npm run build:check` — terse build (`build ok` on success; use this, not `npm run build`).
- `npm test` (vitest) · `npm run test:e2e` (Playwright).
- Deploy = push to `main` → Vercel auto-deploy; verify live bundle hash → HTTP 200.
