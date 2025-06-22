import { GameState } from './types';
import { applyGodmodeIfNeeded } from './godmode';
import { isGodmodeUser } from '@/constants';
import { handleEnemyCollisions, handleSwordfishCollisions } from './collisionHandlers';
import { useFreeBrasilena } from './useFreeBrasilena';

import { updatePlayer } from './player';
import { updateEnemies } from './enemies';
import { handleBonuses } from './bonuses';
import { updateBullets } from './bullets';
// --- FIX: убираем жизненный конфликт с environment, используем только bubblesManager
import { generateBubbles, updateBubbles, drawBubbles } from './bubblesManager';
import { createDefaultPlatforms } from './platformsManager';
import { setupKeyboardHandlers } from './controlsManager';

import { renderScene } from './renderer';
import { gameTick } from './loop';
import { loadImages } from './imageLoader';

import { spawnResourceForType, ResourceType } from './resourceSpawner';
import { spawnDynamicPlatform, updateDynamicPlatforms } from './dynamicPlatforms';
import { createStaticSandLayer } from './staticSandLayer';
import { audioManager, activateAudio } from './audioManager';

// --- ВНИМАНИЕ: Декларация для поддержки window.gameEngineInstance ---
declare global {
  interface Window {
    gameEngineInstance?: any;
  }
}

import { ParticleSystem } from './particleSystem';
import { ScreenShake } from './screenShake';
import { getLevelConfig } from './levels';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private keys: { [key: string]: boolean } = {};
  private lastShotTime = 0;
  private readonly SHOT_COOLDOWN = 200;
  private loadPromise: Promise<void>;

  private player = {
    x: 100,
    y: 300,
    width: 64,
    height: 64,
    velX: 0,
    velY: 0,
    speed: 5,
    jumpPower: -15,
    grounded: false,
    health: 100,
    ammo: 20,
    coins: 0,
    level: 1,
    frame: 0,
    frameTimer: 0,
    frameRate: 8,
    powerUps: {
      speedBoost: false,
      speedBoostTime: 0,
    },
    username: '', // login игрока, теперь есть всегда!
    direction: 1,
    godmode: false as boolean | undefined,
    markJump: false as boolean | undefined,
  };

  private bullets: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction?: number;
  }> = [];

  private enemies: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
  }> = [];

  // Новый массив для врагов Swordfish
  private swordfish: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    direction: number;
    _wavePhase?: number;
    frameTimer?: number;
  }> = [];

  // --> Расширяем тип для coins: разрешаем опциональное поле _bossCoin
  private coins: Array<{ x: number; y: number; width: number; height: number; _bossCoin?: boolean }> = [];
  private pizzas: Array<{ x: number; y: number; width: number; height: number }> = [];
  private brasilenas: Array<{ x: number; y: number; width: number; height: number }> = [];
  private wines: Array<{ x: number; y: number; width: number; height: number }> = [];

  private platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }> = [];

  private images: {
    playerFrames: HTMLImageElement[];
    playerLeft: HTMLImageElement; // добавим
    enemy: HTMLImageElement;
    enemyLeft: HTMLImageElement;
    pizza: HTMLImageElement;
    brasilena: HTMLImageElement;
    wine: HTMLImageElement;
    coin: HTMLImageElement;
    bossLucia: HTMLImageElement;
    swordfishRight: HTMLImageElement;
    swordfishLeft: HTMLImageElement;
  };

  private bubbles: Array<{
    x: number; y: number; radius: number; speed: number; drift: number; driftPhase: number;
    alpha: number;
  }> = [];

  private callbacks: {
    onGameEnd: (victory: boolean, finalStats: any) => void;
    onStateUpdate: (updates: any) => void;
  };

  private mobileControlState: Record<string, boolean> = {};

  private staticSandLayer: HTMLCanvasElement | null = null;

  private freeBrasilena?: ReturnType<typeof useFreeBrasilena>;

  private bossLucia: null | {
    x: number;
    y: number;
    width: number;
    height: number;
    health: number;
    image: HTMLImageElement;
    direction: number;
  } = null;

  private renderer: (ctx: CanvasRenderingContext2D, engine: any) => void = renderScene;

  private scaleFactor: number = 1;

  private dynamicPlatforms: import("./dynamicPlatforms").DynamicPlatform[] = [];
  private lastResourceSpawnTime: number = 0;
  private lastPlatformSpawnTime: number = 0;

  private bossCoinTimer: number | null = null;
  private bossCoinsEndTime: number | null = null;
  private bossCoinTimerRemaining: number | null = null;
  private pauseTimestamp: number | null = null;
  private bossRewardActive: boolean = false;

  private soundEnabled: boolean = true;
  private audioActivated: boolean = false;

  private particleSystem: ParticleSystem = new ParticleSystem();
  private screenShake: ScreenShake = new ScreenShake();

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: {
      onGameEnd: (victory: boolean, finalStats: any) => void;
      onStateUpdate: (updates: any) => void;
      initialState: any;
      freeBrasilena?: ReturnType<typeof useFreeBrasilena>;
      scaleFactor?: number;
    }
  ) {
    // Debug логируем ВСЕ initialState при инициализации движка
    console.log("[GameEngine:constructor] initialState:", options?.initialState);

    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.callbacks = options;

    // handle scaleFactor if provided, default to 1  
    this.scaleFactor = options.scaleFactor ?? 1;

    // [ИСПРАВЛЕНО] Прокидываем ВСЕ параметры начального состояния игрока БЕЗ потери значений!
    // Теперь гарантируем, что godmode, markJump, level попадут в this.player.
    const { godmode, markJump, level, username, ...rest } = options.initialState || {};
    Object.assign(this.player, rest);

    this.player.godmode = !!godmode;
    this.player.markJump = !!markJump;
    if (typeof level === 'number') this.player.level = level;
    
    // КРИТИЧЕСКИ ВАЖНО: устанавливаем username для @MolaMolaCoin
    if (typeof username === 'string') {
      this.player.username = username;
    }

    // Настраиваем jumpPower для спец-режима Mark
    this.player.jumpPower = this.player.markJump ? -20 : -15;

    // ВАЖНО: Применяем godmode ПОСЛЕ установки всех параметров
    if (isGodmodeUser(this.player.username, this.player.godmode)) {
      console.log("[GameEngine] GODMODE ACTIVATED for user:", this.player.username, "godmode flag:", this.player.godmode);
      this.player.health = 100;
      applyGodmodeIfNeeded(this.player, this.player.godmode);
    }

    this.images = {
      playerFrames: [new Image(), new Image()],
      playerLeft: new Image(),
      enemy: new Image(),
      enemyLeft: new Image(),
      pizza: new Image(),
      brasilena: new Image(),
      wine: new Image(),
      coin: new Image(),
      bossLucia: new Image(),
      swordfishRight: new Image(),
      swordfishLeft: new Image(),
    };

    this.loadPromise = loadImages(this.images);
    setupKeyboardHandlers(this.keys, this.shoot.bind(this));
    this.generateLevel();
    this.platforms = createDefaultPlatforms(this.canvas.width, this.canvas.height);
    setTimeout(() => this.generateStaticSandLayer(), 0);

    // Поправленная логика стартовых координат:
    // Находим пол (floor), гарантируем корректную установку позиции игрока строго по верху пола
    const floor = this.platforms.find(
      (p) => Math.abs(p.y + p.height - this.canvas.height) <= 1
    );
    if (floor) {
      this.player.y = floor.y - this.player.height;
      this.player.x = Math.max(
        20,
        Math.min(
          floor.x + floor.width / 2 - this.player.width / 2,
          this.canvas.width - this.player.width - 20
        )
      );
      // !!! ВАЖНО: Устанавливаем velY и grounded прямо сейчас !!!
      this.player.velY = 0;
      this.player.grounded = true;

      // Логируем всё для отладки
      console.log("[GameEngine:Debug] Floor platform:", floor);
      console.log("[GameEngine:Debug] Player position after spawn:", {
        x: this.player.x,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height,
        velY: this.player.velY,
        grounded: this.player.grounded,
        username: this.player.username,
        godmode: this.player.godmode,
        level: this.player.level,
      });

      // Ещё раз убеждаемся что по Y всё сходится:
      if (this.player.y + this.player.height !== floor.y) {
        console.warn(
          `[GameEngine:spawn] fix: player.y (${this.player.y}) + player.height (${this.player.height}) != floor.y (${floor.y}). Correcting...`
        );
        this.player.y = floor.y - this.player.height;
      }
    } else {
      // Если пол не найден — fallback
      this.player.y = Math.max(0, this.canvas.height - this.player.height - 40);
      this.player.x = 100;
      this.player.velY = 0;
      this.player.grounded = true;
      console.log(
        "[GameEngine:spawn] Floor not found! Using fallback: x=100, y=",
        this.player.y
      );
    }
    // runtime check (help debug): после инициализации координаты игрока
    setTimeout(() => {
      console.log(
        `[GameEngine:debug] After 1 tick: player at x=${this.player.x}, y=${this.player.y}, grounded=${this.player.grounded}, username=${this.player.username}, godmode=${this.player.godmode}`
      );
    }, 500);

    // Инициализируем звуки
    this.initializeAudio();

    // После всех инициализаций:
    if (typeof window !== "undefined") {
      window.gameEngineInstance = this;
    }
  }

  public async init() {
    await this.loadPromise;
  }

  private async initializeAudio() {
    console.log('[GameEngine] Initializing audio system...');
    
    // Активируем аудио при первом взаимодействии
    const activateOnInteraction = async (event: Event) => {
      console.log('[GameEngine] User interaction detected:', event.type);
      if (!this.audioActivated) {
        try {
          await activateAudio();
          this.audioActivated = true;
          console.log('[GameEngine] Audio activated successfully on user interaction');
          
          // Запускаем музыку уровня после активации
          if (this.soundEnabled && !audioManager.isMutedState()) {
            console.log('[GameEngine] Starting level music after audio activation');
            audioManager.playLevelMusic(this.player.level || 1);
          }
        } catch (error) {
          console.warn('[GameEngine] Failed to activate audio:', error);
        }
      }
    };

    // Расширенный список событий для мобильных устройств
    const events = ['click', 'keydown', 'touchstart', 'touchend', 'pointerdown', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, activateOnInteraction, { once: true, passive: true });
      // Также слушаем события на canvas
      this.canvas.addEventListener(event, activateOnInteraction, { once: true, passive: true });
    });

    // Пытаемся сразу активировать, если контекст уже разрешен
    try {
      await activateAudio();
      this.audioActivated = true;
      console.log('[GameEngine] Audio activated immediately');
      if (this.soundEnabled && !audioManager.isMutedState()) {
        console.log('[GameEngine] Starting level music immediately');
        audioManager.playLevelMusic(this.player.level || 1);
      }
    } catch (error) {
      console.log('[GameEngine] Audio activation will wait for user interaction');
    }
  }

  public toggleSound() {
    audioManager.toggleMute();
    this.soundEnabled = !audioManager.isMutedState();
    this.updateGameState();
  }

  public isSoundMuted() {
    return audioManager.isMutedState();
  }

  // --- Используем только bubblesManager ---
  private generateBubbles() {
    generateBubbles(this.bubbles, this.canvas);
  }
  private updateBubbles() {
    updateBubbles(this.bubbles, this.canvas);
  }
  private drawBubbles(ctx: CanvasRenderingContext2D) {
    drawBubbles(ctx, this.bubbles);
  }

  public setMobileControlState(control: string, state: boolean) {
    this.mobileControlState[control] = state;
    // Синхронизируем состояние "jump" и "up" для обратной совместимости и полноты
    if (control === "jump") {
      this.mobileControlState["up"] = state;
    } else if (control === "up") {
      this.mobileControlState["jump"] = state;
    }
  }

  private generateStaticSandLayer() {
    const bottomPlatform = this.platforms.find(
      (p) => p.y >= this.canvas.height - 40 - 1
    );
    if (!bottomPlatform) return;
    this.staticSandLayer = createStaticSandLayer(
      bottomPlatform.width,
      bottomPlatform.height
    );
  }



  private spawnResource = (type: ResourceType) => {
    spawnResourceForType({
      type,
      arrays: {
        health: this.pizzas, // Возможно, устаревшее! Но совместимо.
        ammo: this.brasilenas,
        coin: this.coins,
        pizza: this.pizzas,
        brasilena: this.brasilenas,
        wine: this.wines,
      },
      player: this.player,
      platforms: this.getAllPlatforms(),
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      resourceWidth: type === "brasilena" || type === "wine" ? 21 : 32,
      resourceHeight: type === "brasilena" || type === "wine" ? 64 : 32,
    });
  };

  private generateLevel() {
    if (this.freeBrasilena && typeof this.freeBrasilena.reset === "function") {
      this.freeBrasilena.reset();
    }

    this.enemies = [];
    this.swordfish = [];
    this.coins = [];
    this.pizzas = [];
    this.brasilenas = [];
    this.wines = [];

// Сброс таймеров появления ресурсов и платформ при старте уровня
const now = Date.now();
this.lastResourceSpawnTime = now;
this.lastPlatformSpawnTime = now;
this.lastUpdateTimestamp = now;

const config = getLevelConfig(this.player.level);
    // --- Запускаем музыку для этого уровня ---
    if (this.audioActivated && this.soundEnabled && !audioManager.isMutedState()) {
      console.log(`[GameEngine] Starting music for level ${this.player.level}`);
      audioManager.playLevelMusic(this.player.level ?? 1);
    }

    if (config.boss) {
      this.bossLucia = {
        x: 300,
        y: 150,
        width: 128,
        height: 128,
        health: 200 + (this.player.level - 10) * 40,
        image: this.images?.bossLucia ?? new Image(),
        direction: 1,
      };
      for (let i = 0; i < config.pizzaCount; i++) {
        this.pizzas.push({
          x: 250 + Math.random() * 350,
          y: 110 + Math.random() * 200,
          width: 36,
          height: 36,
        });
      }
      for (let i = 0; i < config.wineCount; i++) {
        this.wines.push({
          x: 260 + Math.random() * 320,
          y: 130 + Math.random() * 140,
          width: 32,
          height: 32,
        });
      }
      return;
    }

    this.bossLucia = null;

    const enemyCount = config.enemyCount;
    const coinCount = config.coinCount;

    // canvas.height и sandHeight гарантированы, т.к. инициализированы к этому моменту
    const sandHeight = 40;
    const enemyHeight = 48;
    const upperBoundY = 20; // минимум отступ сверху для рыб
    for (let i = 0; i < enemyCount; i++) {
      const minX = 20, maxX = this.canvas.width - 48 - 20;
      const minY = upperBoundY, maxY = this.canvas.height - sandHeight - enemyHeight - 8;
      // Не спавним рыб под песком!
      this.enemies.push({
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        width: 48,
        height: 48,
        speed: 1 + this.player.level * 0.2
      });
    }

    if (config.swordfishCount && config.swordfishCount > 0) {
      for (let i = 0; i < config.swordfishCount; i++) {
        this.swordfish.push({
          x: Math.random() * (this.canvas.width - 64),
          y: this.canvas.height * 0.4 + Math.random() * (this.canvas.height * 0.2), // середина экрана
          width: 64,
          height: 48,
          direction: Math.random() > 0.5 ? 1 : -1,
          frameTimer: 0,
        });
      }
    }

    for (let i = 0; i < coinCount; i++) {
      this.coins.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
        height: 32
      });
    }

    for (let i = 0; i < config.pizzaCount; i++) {
      this.pizzas.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
        height: 32
      });
    }

    // Бонус "Бразильена" и "Вино" шириной 21px и высотой 64px
    const slimBonusWidth = 21;
    const tallBonusHeight = 64;
    for (let i = 0; i < config.brasilenaCount; i++) {
      this.brasilenas.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: slimBonusWidth,
        height: tallBonusHeight
      });
    }

    for (let i = 0; i < config.wineCount; i++) {
      this.wines.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: slimBonusWidth,
        height: tallBonusHeight
      });
    }

    this.dynamicPlatforms = [];
    // Добавим от 1 до 3 динамических платформ разных типов
    const dynCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < dynCount; i++) {
      const typeRand = Math.random();
      let type: 'static' | 'disappearing' | 'moving' = 'static';
      if (typeRand > 0.8) type = 'moving';
      else if (typeRand > 0.4) type = 'disappearing';
      this.dynamicPlatforms.push(
        spawnDynamicPlatform(
          this.canvas.width,
          this.canvas.height,
          this.dynamicPlatforms,
          type
        )
      );
    }
  }

  // --- NEW: публичный метод для мобильной стрельбы ---
  public fire() {
    this.shoot();
  }

  // Позволяет мгновенно прыгать по мобильному нажатию
  public jump() {
    if (this.player.grounded) {
      this.player.velY = this.player.jumpPower;
      this.player.grounded = false;
      if (this.soundEnabled && this.audioActivated) {
        audioManager.playJumpSound();
      }
    }
  }

  private shoot() {
    const currentTime = Date.now();
    if (this.player.ammo <= 0 || currentTime - this.lastShotTime < this.SHOT_COOLDOWN) {
      return;
    }
    const direction = typeof this.player.direction === "number" ? this.player.direction : 1;

    // Увеличиваем размер пуль для мобильных устройств
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const bulletWidth = isMobile ? 25 : 20;
    const bulletHeight = isMobile ? 12 : 10;

    const bulletX = direction === 1 ? this.player.x + this.player.width : this.player.x - bulletWidth;
    const bulletY = this.player.y + this.player.height / 2 - bulletHeight / 2;

    this.bullets.push({
      x: bulletX,
      y: bulletY,
      width: bulletWidth,
      height: bulletHeight,
      speed: 10 * direction,
      direction
    });

    // Add muzzle flash effect
    this.particleSystem.createMuzzleFlash(
      bulletX + (direction === 1 ? -5 : bulletWidth + 5),
      bulletY + bulletHeight / 2
    );

    // Small screen shake for shooting
    this.screenShake.shake(1, 50);

    this.player.ammo--;
    this.lastShotTime = currentTime;
    
    // Звук выстрела с дополнительной проверкой для мобильных
    if (this.soundEnabled && this.audioActivated) {
      audioManager.playShootSound();
    }
    
    this.updateGameState();
  }

  private updateGameState() {
    // --- score удаляем полностью
    // Применяем godmode если активен
    if (isGodmodeUser(this.player.username, this.player.godmode)) {
      this.player.health = 100;
    }
    this.callbacks.onStateUpdate({
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      level: this.player.level,
      soundMuted: this.isSoundMuted() // добавляем состояние звука
    });
  }

  private lastUpdateTimestamp: number = Date.now();

  private gameLoop = () => {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTimestamp;
    this.lastUpdateTimestamp = now;

    // --- динамика: генерация бонусов и платформ ---
    if (now - this.lastResourceSpawnTime > 2650) {
      if (!this.bossRewardActive) { 
        const types: Array<'health' | 'ammo' | 'coin' | 'pizza' | 'brasilena' | 'wine'> = [
          'coin', 'coin', 'coin', 'coin',
          'pizza', 'health',
          'ammo', 'brasilena',
          'wine'
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        this.spawnResource(type);
      }
      this.lastResourceSpawnTime = now;
    }

    // КОГДА срок босс-монет закончился — удаляем только их
    if (this.bossRewardActive && this.bossCoinsEndTime && now >= this.bossCoinsEndTime) {
      this.coins = this.coins.filter(coin => !coin._bossCoin);
      this.bossRewardActive = false;
      this.bossCoinsEndTime = null;
      this.updateGameState();
    }

    if (now - this.lastPlatformSpawnTime > 4200) {
      if (!this.bossRewardActive) { // не спавним платформы во время фазы сбора босс-монет
        // минимальная плотность плат
        const typeRand = Math.random();
        let type: 'static' | 'disappearing' | 'moving' = 'static';
        if (typeRand > 0.85) type = 'moving';
        else if (typeRand > 0.37) type = 'disappearing';
        this.dynamicPlatforms.push(
          spawnDynamicPlatform(
            this.canvas.width,
            this.canvas.height,
            this.dynamicPlatforms,
            type
          )
        );
      }
      this.lastPlatformSpawnTime = now;
    }

    // двигаем динамические платформы
    updateDynamicPlatforms(
      this.dynamicPlatforms,
      deltaTime,
      this.canvas.width,
      this.canvas.height
    );

    // Update particle system and screen shake
    this.particleSystem.update(deltaTime);
    this.screenShake.update(deltaTime);

    gameTick(this);
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  // --- Переход на следующий уровень: теперь монеты не сбрасываются ---
  public setNextLevel = () => {
    // Запрещаем переход на следующий уровень, пока active boss coins (бонусный период)
    if (this.bossRewardActive) {
      console.log("[GameEngine:setNextLevel] WAIT: бонусный сбор монет ещё идёт, нельзя переходить на новый уровень!");
      return;
    }
    this.player.level = (this.player.level ?? 1) + 1;
    // Монеты НЕ сбрасываем! Просто генерим новый уровень, сохраняется накопленное количество.
    
    // Звук победы на уровне
    if (this.soundEnabled) {
      audioManager.playLevelWinSound();
    }
    
    this.generateLevel();
    this.updateGameState();
  }

  public start() {
    console.log('Starting game engine...');
    const now = Date.now();

    if (this.pauseTimestamp !== null) {
      // Resuming from pause: shift all internal timers forward so they
      // continue as if the game never stopped
      const pausedDuration = now - this.pauseTimestamp;
      this.lastResourceSpawnTime += pausedDuration;
      this.lastPlatformSpawnTime += pausedDuration;
      this.lastShotTime += pausedDuration;
      this.dynamicPlatforms.forEach(p => {
        p.created += pausedDuration;
      });
      this.enemies.forEach(e => {
        if ((e as any)._chaosTimer) (e as any)._chaosTimer += pausedDuration;
      });

      if (this.bossCoinTimerRemaining !== null) {
        if (this.bossCoinTimerRemaining > 0) {
          this.bossCoinTimer = window.setTimeout(this.endBossCoinsReward, this.bossCoinTimerRemaining);
          this.bossCoinsEndTime = now + this.bossCoinTimerRemaining;
        } else {
          this.endBossCoinsReward();
        }
        this.bossCoinTimerRemaining = null;
      } else if (this.bossCoinsEndTime !== null) {
        this.bossCoinsEndTime += pausedDuration;
      }
      this.pauseTimestamp = null;
    }

    // Reset timestamp to avoid huge delta after pause
    this.lastUpdateTimestamp = now;
    this.gameLoop();
  }

  public stop() {
    if (this.freeBrasilena) {
      this.freeBrasilena.cleanup();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.pauseTimestamp = Date.now();

    if (this.bossCoinTimer) {
      clearTimeout(this.bossCoinTimer);
      this.bossCoinTimerRemaining = this.bossCoinsEndTime
        ? Math.max(0, this.bossCoinsEndTime - this.pauseTimestamp)
        : null;
      this.bossCoinTimer = null;
    }
  }

  // --- исп-вать динамические платформы в расчетах игрока ---
  getAllPlatforms() {
    // ВСЕГДА объединять платформы
    return [...this.platforms, ...this.dynamicPlatforms];
  }

  // --- Когда босс побежден: спавним 300 монет на 10 секунд ---
  public spawnBossCoins() {
    // Если уже активировалась награда — не перезапускаем!
    if (this.bossRewardActive) return;

    this.bossRewardActive = true;
    // Сохраняем тайминги только если это окончательная победа над боссом
    this.bossCoinsEndTime = Date.now() + 10000;

    // Удаляем только босс-монеты, если вдруг остались с прошлых попаданий
    this.coins = this.coins.filter(coin => !coin._bossCoin);

    // Размер монеты фиксирован: width 32, height 32
    const TOTAL = 300;
    const bossCoinList = [];
    for (let i = 0; i < TOTAL; i++) {
      bossCoinList.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
        height: 32,
        _bossCoin: true,
      });
    }
    this.coins = [...this.coins, ...bossCoinList];

    // Запускаем таймер на 10 секунд (защита от повторного запуска)
    if (this.bossCoinTimer) {
      clearTimeout(this.bossCoinTimer);
    }
    this.bossCoinTimer = window.setTimeout(this.endBossCoinsReward, 10000);

    // Сразу обновим UI (монет становится много)
    this.updateGameState();
  }

  private endBossCoinsReward = () => {
    this.coins = this.coins.filter(coin => !coin._bossCoin);
    this.bossRewardActive = false;
    this.bossCoinsEndTime = null;
    this.bossCoinTimer = null;
    this.updateGameState();
  };

  // Новый метод: постепенное выпадение части босс-монет при каждом попадании
  public spawnBossCoinsOnHit(count: number, boss: any) {
    // Сколько уже активных босс-монет на карте (может быть до финала!)
    const activeBossCoins = (this.coins.filter(c => c._bossCoin).length) || 0;
    const TOTAL = 300;
    // Не даём спавнить больше 300 суммарно за бой
    if (activeBossCoins >= TOTAL) return;

    const remaining = TOTAL - activeBossCoins;
    const dropCount = Math.min(count, remaining);

    for (let i = 0; i < dropCount; i++) {
      this.coins.push({
        x: boss.x + boss.width / 2 + (Math.random()-0.5)*boss.width,
        y: boss.y + boss.height / 2 + (Math.random()-0.5)*boss.height,
        width: 32,
        height: 32,
        _bossCoin: true,
      });
    }
    // Для попаданий НЕ запускать 10-секундный таймер — только после смерти босса!
  }

  // Новый метод: получить массив Swordfish
  getSwordfish() {
    return this.swordfish;
  }

  // Add method to access particle system
  getParticleSystem() {
    return this.particleSystem;
  }

  // Add method to access screen shake
  getScreenShake() {
    return this.screenShake;
  }
}
