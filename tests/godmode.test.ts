import { describe, it, expect } from 'vitest';
import { isGodmodeUser } from '../src/constants';

describe('isGodmodeUser', () => {
  it('returns true for the special username', () => {
    expect(isGodmodeUser('@MolaMolaCoin')).toBe(true);
  });

  it('returns true when godmode flag is true', () => {
    expect(isGodmodeUser('anything', true)).toBe(true);
  });

  it('returns false for normal users without flag', () => {
    expect(isGodmodeUser('player')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isGodmodeUser('@molamolacoin')).toBe(true);
  });

  it('ignores leading and trailing spaces', () => {
    expect(isGodmodeUser('  @MolaMolaCoin  ')).toBe(true);
  });
});
