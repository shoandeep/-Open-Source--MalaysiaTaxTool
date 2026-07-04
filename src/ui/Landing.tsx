import { Suspense, lazy } from 'react';
import { useVault } from '../state/VaultContext';
import { useTheme } from './theme';
import { ThemeToggle } from './ThemeToggle';
import { CoinLogo } from './CoinLogo';
import { SalaryIcon, BudgetIcon, GoalIcon, TrendIcon } from './icons';

const Hero3D = lazy(() => import('./Hero3D'));

function HeroFallback() {
  return (
    <div className="h-full w-full animate-pulse rounded-3xl bg-gradient-to-br from-primary/15 to-gold/15" />
  );
}

const FEATURES = [
  {
    icon: <SalaryIcon size={22} />,
    title: 'Real Malaysian net pay',
    body: 'Gross → net after EPF, SOCSO, EIS and PCB, using the official statutory tables. Override any line from your payslip.',
  },
  {
    icon: <BudgetIcon size={22} />,
    title: 'Smart budgeting',
    body: 'Split what’s left into savings, investments and spending with your own percentages — no rigid rules.',
  },
  {
    icon: <GoalIcon size={22} />,
    title: 'Emergency fund & goals',
    body: 'Track months of cover, set goals with deadlines, and see the monthly contribution to hit them.',
  },
  {
    icon: <TrendIcon size={22} />,
    title: 'Dynamic daily budget',
    body: 'A live “spend today” number that recomputes every time you log an expense and as the month runs down.',
  },
];

export function Landing() {
  const { startGuest, goToAuth, initialized } = useVault();
  const { resolved } = useTheme();

  return (
    <div className="weave-bg home-bg min-h-dvh overflow-x-hidden text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5 font-display font-semibold tracking-tight">
          <CoinLogo size={40} detail="mark" />
          Finance Guru
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-8 px-5 pb-6 pt-6 md:grid-cols-2 md:pt-12">
        <div>
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-ink-soft backdrop-blur">
            <span className="animate-dot h-1.5 w-1.5 rounded-full bg-positive" />
            100% private · runs in your browser
          </span>
          {/* No entrance animation on the H1: a blurred/late headline reads as broken. */}
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.25rem]">
            Know exactly what your{' '}
            <span className="text-gold-gradient italic">salary becomes</span>.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-ink-soft"
            style={{ animationDelay: '120ms' }}
          >
            A fast, private money manager for Malaysia. Turn your gross pay into net pay after
            statutory deductions, then budget savings, an emergency fund, goals and a live daily
            spending allowance.
          </p>

          {/* The primary CTA is never animation-delayed — it must be tappable immediately. */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={startGuest}
              className="animate-pulse-ring rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Try it now — no signup
            </button>
            <button
              onClick={goToAuth}
              className="rounded-xl border border-line-strong bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-gold/50 hover:bg-surface-2"
            >
              {initialized ? 'Unlock my saved data' : 'Save on this device'}
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            “Try it now” saves nothing — close the tab and it’s gone.
          </p>
        </div>

        {/* Mobile: static coin (instant, crisp in both themes). The three.js scene only
            loads at md+ — it read as a blank gap in light mode and delayed first paint. */}
        <div className="animate-fade-up flex justify-center md:hidden" style={{ animationDelay: '120ms' }}>
          <CoinLogo size={168} detail="full" />
        </div>
        <div className="animate-fade-up relative hidden md:block md:h-96" style={{ animationDelay: '160ms' }}>
          <Suspense fallback={<HeroFallback />}>
            <Hero3D dark={resolved === 'dark'} />
          </Suspense>
        </div>
      </section>

      {/* Privacy callout */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="silk-panel kain-edge overflow-hidden rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-positive/30 bg-positive/12 text-2xl">
              🔒
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-positive">No data is stored.</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                There are <strong className="text-ink">no servers, no accounts, and no tracking</strong>.
                Everything runs entirely inside your browser. In “Try it now” mode{' '}
                <strong className="text-ink">nothing is saved at all</strong> — refresh and it’s gone.
                You can optionally choose “Save on this device,” and even then your data is{' '}
                <strong className="text-ink">
                  encrypted with your passphrase and never leaves your device
                </strong>
                . We literally cannot see it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-5 pb-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group animate-fade-up silk-panel rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40"
              style={{ animationDelay: `${i * 90 + 200}ms` }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-gold/10 font-display text-xl text-gold transition group-hover:scale-110 group-hover:bg-gold/15">
                {f.icon}
              </div>
              <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-ink">
                {f.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="kain-edge relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-contrast">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(50% 80% at 50% 0%, hsl(var(--gold) / 0.35), transparent 70%)',
            }}
          />
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold">Ready in seconds.</h2>
            <p className="mx-auto mt-1 max-w-md text-sm opacity-90">
              No account, no install. Enter your pay and start budgeting.
            </p>
            <button
              onClick={startGuest}
              className="mt-5 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-[hsl(197_40%_8%)] shadow-sm transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Open Finance Guru
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-faint">
          Estimates only — not financial or tax advice. Confirm against your payslip and LHDN / KWSP /
          PERKESO.
        </p>
      </section>
    </div>
  );
}
