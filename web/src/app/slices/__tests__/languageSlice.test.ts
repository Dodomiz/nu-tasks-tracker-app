import { describe, it, expect } from 'vitest';
import reducer, { setLanguage } from '../languageSlice';

describe('languageSlice', () => {
  it('sets language and direction for English', () => {
    const state = { current: 'he', direction: 'rtl' } as any;
    const next = reducer(state, setLanguage('en'));
    expect(next.current).toBe('en');
    expect(next.direction).toBe('ltr');
  });

  it('sets language and direction for Hebrew', () => {
    const state = { current: 'en', direction: 'ltr' } as any;
    const next = reducer(state, setLanguage('he'));
    expect(next.current).toBe('he');
    expect(next.direction).toBe('rtl');
  });
});
