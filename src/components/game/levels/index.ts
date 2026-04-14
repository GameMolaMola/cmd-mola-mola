import type { LevelConfig } from '../types';
import level1Config from './level1';
import level2Config from './level2';
import level3Config from './level3';
import level4Config from './level4';
import level5Config from './level5';
import level6Config from './level6';
import level7Config from './level7';
import level8Config from './level8';
import level9Config from './level9';

const levelConfigs: Record<number, LevelConfig> = {
  1: level1Config,
  2: level2Config,
  3: level3Config,
  4: level4Config,
  5: level5Config,
  6: level6Config,
  7: level7Config,
  8: level8Config,
  9: level9Config,
};

const bossLevelConfig: LevelConfig = {
  enemyCount: 0,
  coinCount: 0,
  pizzaCount: 2,
  brasilenaCount: 0,
  wineCount: 2,
  swordfishCount: 0,
  boss: true,
  background: 'jungle',
};

export function getLevelConfig(level: number): LevelConfig {
  if (level >= 10) return bossLevelConfig;
  return levelConfigs[level] || level1Config;
}

export { levelConfigs, bossLevelConfig };
