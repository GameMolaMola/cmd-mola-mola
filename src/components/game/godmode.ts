
/**
 * Godmode logic for Mola Mola Game
 * Выделена в отдельный модуль для простоты тестирования и интеграции.
 */

export function isGodmodeActive(godmode?: boolean): boolean {
  return !!godmode;
}

/**
 * Принудительно здоровье всегда 100, если godmode.
 */
export function applyGodmodeIfNeeded(player: {health: number}, godmode?: boolean) {
  if (isGodmodeActive(godmode)) {
    player.health = 100;
  }
}
