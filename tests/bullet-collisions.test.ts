import { describe, it, expect, vi } from 'vitest';
import { updateBullets } from '../src/components/game/bullets';

vi.mock('../src/components/game/audioManager', () => ({
  audioManager: {
    playCoinSound: vi.fn(),
    playDamageSound: vi.fn(),
  },
}));

const canvas = { width: 200, height: 200 } as HTMLCanvasElement;

function createBullet() {
  return { x: 0, y: 0, width: 5, height: 5, speed: 0 };
}

describe('updateBullets collisions', () => {
  it('grants coins and removes enemy when bullet hits enemy', () => {
    const player = { coins: 0, level: 1 } as any;
    const bullets = [createBullet()];
    const enemies = [{ x: 0, y: 0, width: 10, height: 10 }];
    const swordfish: any[] = [];
    const callbacks = { onGameEnd: vi.fn(), onStateUpdate: vi.fn() };
    const checkCollision = () => true;

    updateBullets({ bullets, enemies, swordfish, bossLucia: null, player, callbacks, checkCollision, canvas });

    expect(bullets.length).toBe(0);
    expect(enemies.length).toBe(0);
    expect(player.coins).toBe(2);
    expect(callbacks.onStateUpdate).toHaveBeenCalledWith({ coins: 2 });
    expect(callbacks.onGameEnd).not.toHaveBeenCalled();
  });

  it('grants coins and removes swordfish when bullet hits swordfish', () => {
    const player = { coins: 0, level: 1 } as any;
    const bullets = [createBullet()];
    const enemies: any[] = [];
    const swordfish = [{ x: 0, y: 0, width: 10, height: 10 }];
    const callbacks = { onGameEnd: vi.fn(), onStateUpdate: vi.fn() };
    const checkCollision = () => true;

    updateBullets({ bullets, enemies, swordfish, bossLucia: null, player, callbacks, checkCollision, canvas });

    expect(bullets.length).toBe(0);
    expect(swordfish.length).toBe(0);
    expect(player.coins).toBe(5);
    expect(callbacks.onStateUpdate).toHaveBeenCalledWith({ coins: 5 });
    expect(callbacks.onGameEnd).not.toHaveBeenCalled();
  });

  it('damages boss but does not end game if health remains', () => {
    const player = { coins: 0, level: 11 } as any;
    const bullets = [createBullet()];
    const enemies: any[] = [];
    const swordfish: any[] = [];
    const bossLucia = { x: 0, y: 0, width: 10, height: 10, health: 40 };
    const callbacks = { onGameEnd: vi.fn(), onStateUpdate: vi.fn() };
    const checkCollision = () => true;

    updateBullets({ bullets, enemies, swordfish, bossLucia, player, callbacks, checkCollision, canvas });

    expect(bullets.length).toBe(0);
    expect(bossLucia.health).toBe(20);
    expect(callbacks.onGameEnd).not.toHaveBeenCalled();
  });

  it('triggers victory when boss health drops to zero', () => {
    const player = { coins: 10, level: 11 } as any;
    const bullets = [createBullet()];
    const enemies: any[] = [];
    const swordfish: any[] = [];
    const bossLucia = { x: 0, y: 0, width: 10, height: 10, health: 20 };
    const callbacks = { onGameEnd: vi.fn(), onStateUpdate: vi.fn() };
    const checkCollision = () => true;

    updateBullets({ bullets, enemies, swordfish, bossLucia, player, callbacks, checkCollision, canvas });

    expect(bullets.length).toBe(0);
    expect(bossLucia.health).toBe(0);
    expect(player.level).toBe(12);
    expect(callbacks.onGameEnd).toHaveBeenCalledWith(true, {
      level: 12,
      coins: 10,
      score: 10 * 10 + 12 * 100,
    });
  });
});
