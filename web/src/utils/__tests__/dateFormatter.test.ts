import { describe, it, expect } from 'vitest';
import { formatDate, formatRelative } from '../dateFormatter';

describe('dateFormatter', () => {
  it('formats date in English', () => {
    const d = new Date('2025-01-15T12:00:00Z');
    const out = formatDate(d, 'en');
    expect(out).toMatch(/2025/);
  });

  it('formats date in Hebrew', () => {
    const d = new Date('2025-01-15T12:00:00Z');
    const out = formatDate(d, 'he');
    expect(out.length).toBeGreaterThan(0);
  });

  it('formats relative time (seconds/minutes/hours/days)', () => {
    const now = new Date();
    const tenSecAgo = new Date(now.getTime() - 10_000);
    const out = formatRelative(tenSecAgo, now, 'en');
    expect(out).toContain('second');
  });
});
