
export interface GameState {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  powerUps: {
    speedBoost: boolean;
    speedBoostTime: number;
  };
  isVictory: boolean;
  godmode?: boolean;    // теперь поддерживает godmode (опционально)
  markJump?: boolean;   // спец-флаг для отдельного пользователя (опционально)
  username?: string;    // добавляем поле username
  soundMuted?: boolean; // добавляем поле soundMuted для состояния звука
}

export interface LevelConfig {
  enemyCount: number;
  coinCount: number;
  pizzaCount: number;
  brasilenaCount: number;
  wineCount: number;
  swordfishCount?: number;
  boss?: boolean;
  background?: string;
}
