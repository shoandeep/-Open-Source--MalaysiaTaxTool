import { describe, it, expect } from 'vitest';
import { paymentTotals, amountsDue, spendByAccount, spendByPlace, PAYMENT_METHODS } from './payments';
import type { Expense } from '../model/types';

const e = (p: Partial<Expense>): Expense => ({
  id: Math.random().toString(36).slice(2),
  categoryId: '',
  amountSen: 1000,
  dateISO: '2026-06-30',
  ...p,
});

const list: Expense[] = [
  e({ amountSen: 5000, method: 'credit' }),
  e({ amountSen: 3000, method: 'credit' }),
  e({ amountSen: 2000, method: 'bnpl' }),
  e({ amountSen: 1500, method: 'ewallet' }),
  e({ amountSen: 1000, method: 'debit' }),
  e({ amountSen: 800 }), // untagged
];

describe('paymentTotals', () => {
  const t = paymentTotals(list);
  it('sums per method', () => {
    expect(t.byMethod.credit).toBe(8000);
    expect(t.byMethod.bnpl).toBe(2000);
    expect(t.byMethod.ewallet).toBe(1500);
    expect(t.byMethod.debit).toBe(1000);
    expect(t.byMethod.cash).toBe(0);
  });
  it('tracks untagged + grand total', () => {
    expect(t.untaggedSen).toBe(800);
    expect(t.totalSen).toBe(13300);
  });
});

describe('amountsDue', () => {
  it('sums credit + BNPL as owed', () => {
    const d = amountsDue(list);
    expect(d.creditSen).toBe(8000);
    expect(d.bnplSen).toBe(2000);
    expect(d.totalSen).toBe(10000);
  });
  it('is zero with no deferred spend', () => {
    expect(amountsDue([e({ method: 'cash' })]).totalSen).toBe(0);
  });
});

describe('PAYMENT_METHODS', () => {
  it('covers the five methods', () => {
    expect(PAYMENT_METHODS.map((m) => m.id)).toEqual(['cash', 'debit', 'ewallet', 'credit', 'bnpl']);
  });
});

describe('spendByAccount', () => {
  it('groups tagged spend per wallet/card and ignores untagged', () => {
    const m = spendByAccount([
      { id: '1', categoryId: '', amountSen: 100, dateISO: '2026-07-01', method: 'credit', methodAccountId: 'visa' },
      { id: '2', categoryId: '', amountSen: 250, dateISO: '2026-07-02', method: 'credit', methodAccountId: 'visa' },
      { id: '3', categoryId: '', amountSen: 400, dateISO: '2026-07-02', method: 'ewallet', methodAccountId: 'tng' },
      { id: '4', categoryId: '', amountSen: 999, dateISO: '2026-07-03', method: 'cash' },
    ]);
    expect(m.get('visa')).toBe(350);
    expect(m.get('tng')).toBe(400);
    expect(m.size).toBe(2);
  });
});

describe('spendByPlace', () => {
  it('groups case-insensitively, falls back to note, sorts by spend', () => {
    const rows = spendByPlace([
      { id: '1', categoryId: '', amountSen: 100, dateISO: '2026-07-01', place: 'Tesco Ampang' },
      { id: '2', categoryId: '', amountSen: 300, dateISO: '2026-07-02', place: 'tesco ampang' },
      { id: '3', categoryId: '', amountSen: 900, dateISO: '2026-07-02', note: 'Grab' },
      { id: '4', categoryId: '', amountSen: 50, dateISO: '2026-07-03' }, // no tag → skipped
    ]);
    expect(rows.map((r) => r.place)).toEqual(['Grab', 'Tesco Ampang']);
    expect(rows[1]).toMatchObject({ totalSen: 400, count: 2 });
  });
});
