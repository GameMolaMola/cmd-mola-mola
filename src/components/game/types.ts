
export interface GameState {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  powerUps: {
    speedBoost: boolean;
    speedBoostTime: number;
  };
  // isVictory и другие игровые состояния оставить!
  isVictory: boolean;
}
