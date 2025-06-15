
/**
 * Утилиты для HUD и бизнес-логики: сравнение HUD, фабрики обработчиков на обновление состояния и конца игры
 */

// Глубокое сравнение hud (4 поля)
export function isEqualHud(a: any, b: any) {
  return (
    a.health === b.health &&
    a.ammo === b.ammo &&
    a.coins === b.coins &&
    a.level === b.level
  );
}

/**
 * Фабрика для onStateUpdate — возвращает функцию, связанную с нужными setHud/currentRef
 */
export function onStateUpdateFactory({ setHud, justResetGameRef }: {
  setHud: (cb: (prev: any) => any) => void,
  justResetGameRef: React.RefObject<boolean>
}) {
  return (updates: any) => {
    setHud((prev: any) => {
      const safeUpdates = updates ?? {};
      let changed = false;
      let nextHud = { ...prev };

      if (
        typeof safeUpdates.health === "number" &&
        isFinite(safeUpdates.health) &&
        safeUpdates.health !== prev.health &&
        safeUpdates.health >= 0 &&
        safeUpdates.health <= 100
      ) {
        nextHud.health = safeUpdates.health;
        changed = true;
      }
      if (
        typeof safeUpdates.ammo === "number" &&
        isFinite(safeUpdates.ammo) &&
        safeUpdates.ammo !== prev.ammo &&
        safeUpdates.ammo >= 0 &&
        safeUpdates.ammo <= 999
      ) {
        nextHud.ammo = safeUpdates.ammo;
        changed = true;
      }
      if (
        typeof safeUpdates.coins === "number" &&
        isFinite(safeUpdates.coins)
      ) {
        const coinsVal = Math.max(0, Math.min(1000, safeUpdates.coins));
        if (coinsVal !== prev.coins) {
          nextHud.coins = coinsVal;
          changed = true;
        }
      }
      const levelValid =
        typeof safeUpdates.level === "number" &&
        isFinite(safeUpdates.level) &&
        safeUpdates.level > 0 &&
        safeUpdates.level < 1000;

      if (levelValid) {
        const resetOrLevelIncreased =
          justResetGameRef.current || safeUpdates.level >= prev.level;

        if (
          safeUpdates.level !== prev.level &&
          resetOrLevelIncreased
        ) {
          nextHud.level = safeUpdates.level;
          changed = true;
        }
      }
      if (justResetGameRef.current) justResetGameRef.current = false;
      if (!changed || isEqualHud(nextHud, prev)) {
        return prev;
      }
      return nextHud;
    });
  };
}

/**
 * Фабрика обработчика конца игры для useMolaMolaGameCore.
 */
export function handleGameEndFactory({
  setGameEnded, setVictory, setFinalStats, setIsPaused, setGameSessionId, setHud,
  gameSessionId
}: any) {
  return (isVictory: boolean, stats: any) => {
    setGameEnded(true);
    setVictory(isVictory);
    setFinalStats(stats);
    setIsPaused(false);
    setGameSessionId(Date.now());
    setHud((h: any) => ({
      ...h,
      level: stats?.level ?? h.level,
      coins: stats?.coins ?? h.coins,
    }));
  };
}
