
import type { GameState } from "./types";

// Обновим сигнатуру для доп. опций
export function makeInitialGameState(
  playerLevel = 1,
  godmode = false,
  markJump = false
): GameState {
  return {
    health: 100,
    ammo: 10,
    coins: 0,
    level: playerLevel,
    godmode,     // <- теперь флаг godmode строго фиксируется в state
    markJump,    // <- спец-режим для Mark
    powerUps: {
      speedBoost: false,
      speedBoostTime: 0,
    },
    isVictory: false,
  };
}
