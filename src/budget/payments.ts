/**
 * Payment-method analytics: how much was spent via each method and how much is
 * still owed on the deferred methods (credit card + BNPL). Pure + integer sen.
 */
import type { Expense, PaymentMethod } from '../model/types';
import type { Sen } from '../money/money';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; emoji: string }[] = [
  { id: 'cash', label: 'Cash', emoji: '💵' },
  { id: 'debit', label: 'Debit', emoji: '🏧' },
  { id: 'ewallet', label: 'E-wallet', emoji: '📱' },
  { id: 'credit', label: 'Credit', emoji: '💳' },
  { id: 'bnpl', label: 'BNPL', emoji: '⏳' },
];

export const PAYMENT_LABEL: Record<PaymentMethod, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.label]),
) as Record<PaymentMethod, string>;

export const PAYMENT_EMOJI: Record<PaymentMethod, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.emoji]),
) as Record<PaymentMethod, string>;

/** Deferred methods you settle later — tracked as money owed. */
export const DEFERRED_METHODS: PaymentMethod[] = ['credit', 'bnpl'];

export interface MethodTotals {
  /** Sum spent per method. */
  byMethod: Record<PaymentMethod, Sen>;
  /** Sum of expenses with no method set. */
  untaggedSen: Sen;
  /** Grand total across the given expenses. */
  totalSen: Sen;
}

function emptyByMethod(): Record<PaymentMethod, Sen> {
  return { cash: 0, debit: 0, ewallet: 0, credit: 0, bnpl: 0 };
}

/** Totals per payment method across the given expenses. */
export function paymentTotals(expenses: Expense[]): MethodTotals {
  const byMethod = emptyByMethod();
  let untaggedSen = 0;
  let totalSen = 0;
  for (const e of expenses) {
    totalSen += e.amountSen;
    if (e.method) byMethod[e.method] += e.amountSen;
    else untaggedSen += e.amountSen;
  }
  return { byMethod, untaggedSen, totalSen };
}

export interface AmountsDue {
  creditSen: Sen;
  bnplSen: Sen;
  totalSen: Sen;
}

/**
 * Outstanding on the deferred methods — the running total charged to credit card
 * and BNPL across all the given expenses. (Settling these down is a follow-up.)
 */
export function amountsDue(expenses: Expense[]): AmountsDue {
  let creditSen = 0;
  let bnplSen = 0;
  for (const e of expenses) {
    if (e.method === 'credit') creditSen += e.amountSen;
    else if (e.method === 'bnpl') bnplSen += e.amountSen;
  }
  return { creditSen, bnplSen, totalSen: creditSen + bnplSen };
}

/**
 * Spend per specific account (wallet/card) for expenses tagged with a
 * methodAccountId — newest ids keep insertion order. Display-only: the
 * DebtAccount's entered bill stays authoritative for what you owe.
 */
export function spendByAccount(expenses: Expense[]): Map<string, Sen> {
  const acc = new Map<string, Sen>();
  for (const e of expenses) {
    if (!e.methodAccountId) continue;
    acc.set(e.methodAccountId, (acc.get(e.methodAccountId) ?? 0) + e.amountSen);
  }
  return acc;
}

/** Month spend grouped by free-text place tag (case-insensitive, trimmed; largest first). */
export function spendByPlace(expenses: Expense[]): { place: string; totalSen: Sen; count: number }[] {
  const acc = new Map<string, { place: string; totalSen: Sen; count: number }>();
  for (const e of expenses) {
    const raw = (e.place ?? e.note ?? '').trim();
    if (!raw) continue;
    const key = raw.toLocaleLowerCase();
    const cur = acc.get(key) ?? { place: raw, totalSen: 0, count: 0 };
    cur.totalSen += e.amountSen;
    cur.count += 1;
    acc.set(key, cur);
  }
  return [...acc.values()].sort((a, b) => b.totalSen - a.totalSen);
}
