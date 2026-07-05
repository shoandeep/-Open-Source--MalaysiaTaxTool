/**
 * Investment tracking summary — Malaysian vehicles as first-class types.
 * Projection is display-only (declared/expected rate × holdings, simple, p.a.);
 * this app records what you hold, it never advises or trades.
 */
import { addSen, roundHalfUp, type Sen } from '../money/money';
import type { Investment, InvestmentType } from '../model/types';

export const INVESTMENT_TYPES: { id: InvestmentType; label: string; emoji: string }[] = [
  { id: 'stocks', label: 'Stocks', emoji: '📈' },
  { id: 'unitTrust', label: 'Unit trust', emoji: '🧺' },
  { id: 'asnb', label: 'ASNB', emoji: '🇲🇾' },
  { id: 'tabungHaji', label: 'Tabung Haji', emoji: '🕌' },
  { id: 'robo', label: 'Robo-advisor', emoji: '🤖' },
  { id: 'crypto', label: 'Crypto', emoji: '🪙' },
  { id: 'epf', label: 'EPF (voluntary)', emoji: '🏛️' },
  { id: 'other', label: 'Other', emoji: '💼' },
];

export const INVESTMENT_LABEL: Record<InvestmentType, string> = Object.fromEntries(
  INVESTMENT_TYPES.map((t) => [t.id, t.label]),
) as Record<InvestmentType, string>;

export interface InvestSummary {
  totalSen: Sen;
  /** Projected annual earnings across holdings that declare a rate (half-up). */
  projectedAnnualSen: Sen;
  /** Total per vehicle type (only types that appear), insertion-ordered by INVESTMENT_TYPES. */
  byType: { type: InvestmentType; totalSen: Sen; count: number }[];
}

export function investSummary(investments: Investment[]): InvestSummary {
  const named = investments.filter((i) => i.name.trim());
  const totalSen = addSen(...named.map((i) => i.currentSen));
  const projectedAnnualSen = addSen(
    ...named.map((i) => (i.ratePercent && i.ratePercent > 0 ? roundHalfUp((i.currentSen * i.ratePercent) / 100) : 0)),
  );
  const acc = new Map<InvestmentType, { totalSen: Sen; count: number }>();
  for (const i of named) {
    const t: InvestmentType = i.type ?? 'other';
    const cur = acc.get(t) ?? { totalSen: 0, count: 0 };
    acc.set(t, { totalSen: cur.totalSen + i.currentSen, count: cur.count + 1 });
  }
  const byType = INVESTMENT_TYPES.filter((t) => acc.has(t.id)).map((t) => ({
    type: t.id,
    ...acc.get(t.id)!,
  }));
  return { totalSen, projectedAnnualSen, byType };
}
