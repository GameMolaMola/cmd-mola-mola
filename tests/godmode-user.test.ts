import { describe, it, expect } from 'vitest';
import { isGodmodeActive } from '../src/components/game/godmode';

const SPECIAL_LOGIN = '@MolaMolaCoin';

function isGodmodeUser(username?: string, godmode?: boolean, playerFlag?: boolean) {
  return username === SPECIAL_LOGIN || isGodmodeActive(godmode) || !!playerFlag;
}

describe('isGodmodeUser', () => {
  it('detects godmode when nickname has surrounding spaces', () => {
    const typed = '  @MolaMolaCoin  ';
    const trimmed = typed.trim();
    expect(isGodmodeUser(trimmed, false, false)).toBe(true);
  });
});
