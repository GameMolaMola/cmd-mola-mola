
// Добавим jumpBoost и jumpBoostTime в powerUps:
export interface GameState {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  powerUps: {
    speedBoost: boolean;
    speedBoostTime: number;
    jumpBoost: boolean;
    jumpBoostTime: number;
  };
}
