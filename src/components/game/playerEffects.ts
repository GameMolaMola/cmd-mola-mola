
/**
 * Централизованный модуль управления эффектами игрока.
 * Пока покрывает: Wine Jump Boost
 */
export type Player = {
  jumpPower: number;
  _originalJumpPower?: number;
  _hasWineJumpBoost?: boolean;
  _wineBoostTimeout?: NodeJS.Timeout | null;
};

export function activateWineJumpBoost(player: Player) {
  // Сохраняем изначальную силу прыжка если нужно
  if (!player._originalJumpPower) {
    player._originalJumpPower = typeof player.jumpPower === "number" ? player.jumpPower : -15;
  }
  if (!player._wineBoostTimeout) {
    // Эффект x4 прыжка на 10 секунд
    player.jumpPower = player._originalJumpPower * 4;
    player._hasWineJumpBoost = true;
    player._wineBoostTimeout = setTimeout(() => {
      deactivateWineJumpBoost(player);
    }, 10000);
    console.log("[playerEffects] Wine Jump Boost ACTIVATED, jumpPower x4:", player.jumpPower);
  } else {
    // Если эффект уже активен – только сбрасываем таймер, параметры не меняем, не стакаем!
    clearTimeout(player._wineBoostTimeout);
    player._wineBoostTimeout = setTimeout(() => {
      deactivateWineJumpBoost(player);
    }, 10000);
    console.log("[playerEffects] Wine Jump Boost timer RESET to 10s");
  }
}

export function deactivateWineJumpBoost(player: Player) {
  if (player._originalJumpPower !== undefined) {
    player.jumpPower = player._originalJumpPower;
  } else {
    player.jumpPower = -15;
  }
  player._hasWineJumpBoost = false;
  player._wineBoostTimeout = null;
  console.log("[playerEffects] Wine Jump Boost DEACTIVATED, jumpPower restored:", player.jumpPower);
}

export function isWineJumpActive(player: Player) {
  return !!player._hasWineJumpBoost;
}
