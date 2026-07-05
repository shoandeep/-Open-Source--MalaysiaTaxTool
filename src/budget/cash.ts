/**
 * "Where your cash rests" — potential interest on idle (non-investment) money in
 * banks, e-wallets and fixed deposits. Promo (limited-time) rates apply while
 * active; otherwise the base rate is used. Integer sen, rounded half-up.
 */
import { addSen, roundHalfUp, type Sen } from '../money/money';
import { parseISO, daysInMonth, daysBetweenISO } from './dates';
import type { CashAccount, CashAccountType } from '../model/types';

/** A fixed deposit's derived maturity facts (Malaysian FDs: simple interest at maturity). */
export interface FdStatus {
  maturityISO: string;
  daysToMaturity: number; // negative once past
  matured: boolean;
  /** Simple interest for the full tenure: balance × rate × months / 1200 (half-up). */
  interestSen: Sen;
  maturityValueSen: Sen;
}

export interface CashAccountStatus {
  id: string;
  name: string;
  type: CashAccountType;
  balanceSen: Sen;
  baseRatePercent: number;
  effectiveRatePercent: number;
  promoActive: boolean;
  annualEarningsSen: Sen;
  monthlyEarningsSen: Sen;
  /** Present only for FDs with a start date + term. */
  fd?: FdStatus;
}

/** `iso` plus n months, clamping the day (31 Jan + 1mo → 28/29 Feb). */
export function addMonthsClampISO(iso: string, months: number): string {
  const { year, month, day } = parseISO(iso);
  const total = year * 12 + (month - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  const d = Math.min(day, daysInMonth(y, m));
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** FD maturity facts, or undefined when the account isn't a configured FD. */
export function fdStatus(acc: CashAccount, todayISO: string): FdStatus | undefined {
  if (acc.type !== 'fd' || !acc.startDate || !acc.termMonths || acc.termMonths <= 0) return undefined;
  const maturityISO = addMonthsClampISO(acc.startDate, acc.termMonths);
  const daysToMaturity = daysBetweenISO(todayISO, maturityISO);
  // FDs use the placement (promo) rate for the whole tenure when one is set.
  const rate = acc.promoRatePercent != null && acc.promoRatePercent > 0 ? acc.promoRatePercent : acc.ratePercent;
  const interestSen = roundHalfUp((acc.balanceSen * rate * acc.termMonths) / 1200);
  return {
    maturityISO,
    daysToMaturity,
    matured: daysToMaturity <= 0,
    interestSen,
    maturityValueSen: acc.balanceSen + interestSen,
  };
}

export function cashAccountStatus(acc: CashAccount, todayISO: string): CashAccountStatus {
  const hasPromo = acc.promoRatePercent != null && acc.promoRatePercent > 0;
  const promoActive = hasPromo && (!acc.promoEnds || acc.promoEnds >= todayISO);
  const effectiveRatePercent = promoActive ? acc.promoRatePercent! : acc.ratePercent;
  const annualEarningsSen = roundHalfUp((acc.balanceSen * effectiveRatePercent) / 100);
  const fd = fdStatus(acc, todayISO);
  return {
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balanceSen: acc.balanceSen,
    baseRatePercent: acc.ratePercent,
    effectiveRatePercent,
    promoActive,
    annualEarningsSen,
    monthlyEarningsSen: roundHalfUp(annualEarningsSen / 12),
    ...(fd ? { fd } : {}),
  };
}

export interface CashSummary {
  totalBalanceSen: Sen;
  totalAnnualEarningsSen: Sen;
  totalMonthlyEarningsSen: Sen;
  /** Blended effective rate across all accounts (%, p.a.). */
  blendedRatePercent: number;
  accounts: CashAccountStatus[];
}

export function cashSummary(accounts: CashAccount[], todayISO: string): CashSummary {
  const statuses = accounts.map((a) => cashAccountStatus(a, todayISO));
  const totalBalanceSen = addSen(...statuses.map((s) => s.balanceSen));
  const totalAnnualEarningsSen = addSen(...statuses.map((s) => s.annualEarningsSen));
  return {
    totalBalanceSen,
    totalAnnualEarningsSen,
    totalMonthlyEarningsSen: roundHalfUp(totalAnnualEarningsSen / 12),
    blendedRatePercent: totalBalanceSen > 0 ? (totalAnnualEarningsSen / totalBalanceSen) * 100 : 0,
    accounts: statuses,
  };
}
