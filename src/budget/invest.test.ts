import { describe, it, expect } from 'vitest';
import { investSummary } from './invest';
import type { Investment } from '../model/types';

describe('investment summary', () => {
  const inv: Investment[] = [
    { id: '1', name: 'ASB', currentSen: 2_000_000, type: 'asnb', ratePercent: 5.25 },
    { id: '2', name: 'Maybank stocks', currentSen: 1_000_000, type: 'stocks' },
    { id: '3', name: 'TH', currentSen: 500_000, type: 'tabungHaji', ratePercent: 3.1 },
    { id: '4', name: 'StashAway', currentSen: 300_000, type: 'robo' },
    { id: '5', name: '', currentSen: 999_999 }, // unnamed rows are ignored
  ];

  it('totals holdings and groups by type in canonical order', () => {
    const s = investSummary(inv);
    expect(s.totalSen).toBe(3_800_000);
    expect(s.byType.map((t) => t.type)).toEqual(['stocks', 'asnb', 'tabungHaji', 'robo']);
    expect(s.byType.find((t) => t.type === 'asnb')!.totalSen).toBe(2_000_000);
  });

  it('projects annual earnings only for holdings that declare a rate (half-up)', () => {
    const s = investSummary(inv);
    // ASB RM20,000 × 5.25% = RM1,050.00; TH RM5,000 × 3.1% = RM155.00
    expect(s.projectedAnnualSen).toBe(105_000 + 15_500);
  });

  it('defaults untyped holdings to other', () => {
    const s = investSummary([{ id: 'x', name: 'Misc', currentSen: 100 }]);
    expect(s.byType).toEqual([{ type: 'other', totalSen: 100, count: 1 }]);
  });
});
