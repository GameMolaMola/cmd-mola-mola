
export interface GameState {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  powerUps: {
    speedBoost: boolean;
    speedBoostTime: number;
  };
  // Added missing properties for UI and game end screens
  score: number;
  isVictory: boolean;
}
