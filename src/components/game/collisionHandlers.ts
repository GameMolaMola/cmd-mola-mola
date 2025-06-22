
import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
import { takeDamage, Player } from './playerEffects'; // используем Player из playerEffects
import { audioManager } from './audioManager';
import { isGodmodeUser } from '@/constants';

type Enemy = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Swordfish = {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: number;
};

type GameCallbacks = {
  onGameEnd: (victory: boolean, finalStats: any) => void;
  onStateUpdate: (updates: any) => void;
};

const DAMAGE_COOLDOWN = 400; // наносить урон не чаще чем раз в 400 мс
const SWORDFISH_DAMAGE_COOLDOWN = 800; // больший кулдаун для Swordfish

export function handleEnemyCollisions(
  player: Player,
  enemies: Enemy[],
  godmode: boolean,
  checkCollision: (a: any, b: any) => boolean,
  callbacks: GameCallbacks
) {
  const now = Date.now();
  // Используем lastDamageTime на игроке (уникально для каждой игровой сессии)
  if (!('_lastDamageTime' in player)) player._lastDamageTime = 0;

  // НЕ даём несколько раз подряд выполнять урон и не трогаем если погиб
  if (player.health === 0) return false;

  let collided = false;
  for (const enemy of enemies) {
    if (checkCollision(player, enemy)) {
      collided = true;
      
      // Проверяем godmode двумя способами: через флаг godmode ИЛИ через username
      const godmodeUser = isGodmodeUser(player?.username, godmode || player.godmode);
      
      console.log('[collisionHandlers] Collision detected:', {
        username: player?.username,
        godmode: godmode,
        playerGodmode: player.godmode,
        isGodmodeUser: godmodeUser
      });
      
      if (godmodeUser) {
        // Принудительно устанавливаем здоровье в 100 для godmode пользователей
        player.health = 100;
        console.log('[collisionHandlers] Godmode active - health set to 100');
        continue;
      } else {
        if (now - player._lastDamageTime >= DAMAGE_COOLDOWN) {
          player._lastDamageTime = now;
          takeDamage(player, 2);
          if (player.health < 0) player.health = 0;
          
          // Звук получения урона
          audioManager.playDamageSound();
          
          callbacks.onStateUpdate?.({
            health: player.health,
          });
          if (player.health === 0) {
            // Звук поражения
            audioManager.playGameOverSound();
            
            callbacks.onGameEnd(false, { 
              level: player.level, 
              coins: player.coins
            });
            return true; // game ended
          }
        }
      }
    }
  }
  return false;
}

export function handleSwordfishCollisions(
  player: Player,
  swordfish: Swordfish[],
  godmode: boolean,
  checkCollision: (a: any, b: any) => boolean,
  callbacks: GameCallbacks
) {
  const now = Date.now();
  // Используем отдельный таймер для Swordfish
  if (!('_lastSwordfishDamageTime' in player)) player._lastSwordfishDamageTime = 0;

  // НЕ даём несколько раз подряд выполнять урон и не трогаем если погиб
  if (player.health === 0) return false;

  let collided = false;
  for (const sword of swordfish) {
    if (checkCollision(player, sword)) {
      collided = true;
      
      // Проверяем godmode двумя способами: через флаг godmode ИЛИ через username
      const godmodeUser = isGodmodeUser(player?.username, godmode || player.godmode);
      
      console.log('[collisionHandlers] Swordfish collision detected:', {
        username: player?.username,
        godmode: godmode,
        playerGodmode: player.godmode,
        isGodmodeUser: godmodeUser
      });
      
      if (godmodeUser) {
        // Принудительно устанавливаем здоровье в 100 для godmode пользователей
        player.health = 100;
        console.log('[collisionHandlers] Godmode active - health set to 100');
        continue;
      } else {
        if (now - (player._lastSwordfishDamageTime || 0) >= SWORDFISH_DAMAGE_COOLDOWN) {
          player._lastSwordfishDamageTime = now;
          takeDamage(player, 30); // 30% урона
          if (player.health < 0) player.health = 0;
          
          // Звук получения урона
          audioManager.playDamageSound();
          
          callbacks.onStateUpdate?.({
            health: player.health,
          });
          if (player.health === 0) {
            // Звук поражения
            audioManager.playGameOverSound();
            
            callbacks.onGameEnd(false, { 
              level: player.level, 
              coins: player.coins
            });
            return true; // game ended
          }
        }
      }
    }
  }
  return false;
}
