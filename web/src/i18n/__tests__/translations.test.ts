import { describe, it, expect } from 'vitest';
import en from '../../../public/locales/en/translation.json';
import he from '../../../public/locales/he/translation.json';

describe('i18n translation keys', () => {
  it('English translation file has required keys', () => {
    expect(en).toHaveProperty('common');
    expect(en).toHaveProperty('auth');
    expect(en).toHaveProperty('dashboard');
    expect(en.auth).toHaveProperty('login');
    expect(en.auth).toHaveProperty('register');
  });

  it('Hebrew translation file has same top-level keys as English', () => {
    const enKeys = Object.keys(en).sort();
    const heKeys = Object.keys(he).sort();
    expect(heKeys).toEqual(enKeys);
  });

  it('Hebrew translation has login keys', () => {
    expect(he.auth.login).toHaveProperty('title');
    expect(he.auth.login).toHaveProperty('email');
    expect(he.auth.login).toHaveProperty('password');
  });

  it('All auth.login keys exist in both languages', () => {
    const enLoginKeys = Object.keys(en.auth.login).sort();
    const heLoginKeys = Object.keys(he.auth.login).sort();
    expect(heLoginKeys).toEqual(enLoginKeys);
  });
});
