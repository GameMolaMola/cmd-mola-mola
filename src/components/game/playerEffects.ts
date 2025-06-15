/**
 * Централизованный модуль управления всеми эффектами игрока.
 * Управляет: лечением, пополнением патронов, монетами, винным усилителем прыжка.
 */

export type Player = {
  health: number;
  ammo: number;
  coins: number;
  jumpPower: number;
  _originalJumpPower?: number;
  _hasWineJumpBoost?: boolean;
  _wineBoostTimeout?: NodeJS.Timeout | null;
  [key: string]: any;
};

/** Лечит игрока на amount, максимум до 100. */
export function heal(player: Player, amount: number) {
  const prev = player.health;
  player.health = Math.min(100, player.health + amount);
  console.log(`[playerEffects] heal from ${prev} to ${player.health} (+${amount})`);
}

/** Уменьшает здоровье игрока на amount, минимум 0. */
export function takeDamage(player: Player, amount: number) {
  const prev = player.health;
  player.health = Math.max(0, player.health - amount);
  console.log(`[playerEffects] takeDamage from ${prev} to ${player.health} (-${amount})`);
}

/** Добавляет патроны. */
export function addAmmo(player: Player, amount: number) {
  const prev = player.ammo;
  player.ammo += amount;
  console.log(`[playerEffects] ammo from ${prev} to ${player.ammo} (+${amount})`);
}

/** Добавляет монеты. */
export function addCoin(player: Player, amount = 1) {
  const prev = player.coins;
  player.coins += amount;
  console.log(`[playerEffects] coins from ${prev} to ${player.coins} (+${amount})`);
}

/** Wine Jump Boost: увеличивает jumpPower в 2 раза на 10 секунд, не стакается, только обновляет время. */
export function activateWineJumpBoost(player: Player) {
  if (player._hasWineJumpBoost) {
    // Обновляем таймер, не меняем jumpPower, если буст уже активен
    if (player._wineBoostTimeout) {
      clearTimeout(player._wineBoostTimeout);
    }
    player._wineBoostTimeout = setTimeout(() => {
      deactivateWineJumpBoost(player);
    }, 10000);
    console.log("[playerEffects] Wine Jump Boost timer RESET to 10s");
    return;
  }

  // Сохраняем исходный jumpPower только при первом активации буста
  player._originalJumpPower = typeof player.jumpPower === "number" ? player.jumpPower : -15;
  player.jumpPower = player._originalJumpPower * 2;
  player._hasWineJumpBoost = true;
  player._wineBoostTimeout = setTimeout(() => {
    deactivateWineJumpBoost(player);
  }, 10000);
  console.log("[playerEffects] Wine Jump Boost ACTIVATED, jumpPower x2:", player.jumpPower);
}

export function deactivateWineJumpBoost(player: Player) {
  if (player._originalJumpPower !== undefined) {
    player.jumpPower = player._originalJumpPower;
  } else {
    player.jumpPower = -15;
  }
  player._hasWineJumpBoost = false;
  if (player._wineBoostTimeout) {
    clearTimeout(player._wineBoostTimeout);
  }
  player._wineBoostTimeout = null;
  console.log("[playerEffects] Wine Jump Boost DEACTIVATED, jumpPower restored:", player.jumpPower);
}

export function isWineJumpActive(player: Player) {
  return !!player._hasWineJumpBoost;
}
