import { describe, it, expect, vi } from 'vitest';
import { isGodmodeUser } from '../src/constants';
import { applyGodmodeIfNeeded } from '../src/components/game/godmode';

vi.mock('../src/components/game/audioManager', () => ({
  audioManager: {
    playDamageSound: vi.fn(),
    playGameOverSound: vi.fn(),
  },
}));

import { handleEnemyCollisions } from '../src/components/game/collisionHandlers';

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

  it('handles spaces and case together', () => {
    expect(isGodmodeUser('  @molamolacoin  ')).toBe(true);
  });
});

describe('godmode integration', () => {
  it('forces full health on initialization for special user', () => {
    const player = { health: 50 };
    applyGodmodeIfNeeded(player, isGodmodeUser(' @molamolacoin '));
    expect(player.health).toBe(100);
  });

  it('prevents damage when collided', () => {
    const player: any = { health: 100, username: ' @molamolacoin ', level: 1, coins: 0 };
    const enemy = { x: 0, y: 0, width: 10, height: 10 };
    const checkCollision = () => true;
    const callbacks = { onGameEnd: vi.fn(), onStateUpdate: vi.fn() };
    handleEnemyCollisions(player, [enemy], false, checkCollision, callbacks);
    expect(player.health).toBe(100);
    expect(callbacks.onGameEnd).not.toHaveBeenCalled();
  });
});
