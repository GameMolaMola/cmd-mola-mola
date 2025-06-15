
import type { GameState } from "./types";

export function makeInitialGameState(playerLevel = 1): GameState {
  return {
    health: 100,
    ammo: 10,
    coins: 0,
    level: playerLevel,
    powerUps: {
      speedBoost: false,
      speedBoostTime: 0,
      jumpBoost: false,
      jumpBoostTime: 0,
    },
  };
}
