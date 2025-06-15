
// Добавим jumpBoost и jumpBoostTime в powerUps, как в вашем примере:
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
