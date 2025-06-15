
/**
 * Утилиты для простой персистенции игровых наград/достижений (монеты, maxLevel)
 */

// Определяем, какие ключи будем сохранять
const STORAGE_KEY = 'mm_settings_v1';

export type GamePersistentSettings = {
  totalCoins: number;
  maxLevel: number;
};

export function loadGameSettings(): GamePersistentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        totalCoins: typeof d.totalCoins === 'number' ? d.totalCoins : 0,
        maxLevel: typeof d.maxLevel === 'number' ? d.maxLevel : 1,
      };
    }
  } catch (e) {
    // fail silently
  }
  return {
    totalCoins: 0,
    maxLevel: 1,
  };
}

export function saveGameSettings(settings: GamePersistentSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    console.log("[gameSettingsManager] Game settings saved!", settings);
  } catch (e) {
    // fail silently
  }
}

export function updateSettingsOnGameProgress(newCoins: number, newLevel: number) {
  const settings = loadGameSettings();
  let changed = false;

  // Копим общее число монет (простая модель: каждый собранный coin — +1)
  if (newCoins > 0) {
    settings.totalCoins += newCoins;
    changed = true;
  }

  // обновить maxLevel если достигли нового
  if (newLevel > settings.maxLevel) {
    settings.maxLevel = newLevel;
    changed = true;
  }

  if (changed) {
    saveGameSettings(settings);
  }
}
