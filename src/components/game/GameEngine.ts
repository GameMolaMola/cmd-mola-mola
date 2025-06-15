import { GameState } from './types';
import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
import { handleEnemyCollisions } from './collisionHandlers';
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

// --- ВНИМАНИЕ: Декларация для поддержки window.gameEngineInstance ---
declare global {
  interface Window {
    gameEngineInstance?: any;
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private keys: { [key: string]: boolean } = {};
  private lastShotTime = 0;
  private readonly SHOT_COOLDOWN = 200;

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
    direction: 1, // <--- добавим по умолчанию вправо
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
    backgrounds: { img: HTMLImageElement; level: number }[];
    bossLucia: HTMLImageElement;
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

  private godmode: boolean = false;

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
  private bossRewardActive: boolean = false;

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
    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.callbacks = options;

    // handle scaleFactor if provided, default to 1  
    this.scaleFactor = options.scaleFactor ?? 1;

    // Учитываем ВСЕ параметры initialState включая godmode, markJump, level
    Object.assign(this.player, options.initialState);

    // Протаскиваем логин (username) в player, если есть
    if (options.initialState && options.initialState.username) {
      this.player.username = options.initialState.username;
    }

    // !!! фиксируем jumpPower для спец-флагов !!!
    if (options.initialState?.markJump) {
      this.player.jumpPower = -15;
    } else {
      this.player.jumpPower = -15;
    }

    // ВАЖНО: godmode, level и прочее строго берём из initialState
    this.godmode = !!(options.initialState && options.initialState.godmode);
    this.player.godmode = this.godmode;
    applyGodmodeIfNeeded(this.player, this.godmode);
    if (this.godmode) {
      this.player.health = 100;
    }

    // Если задан стартовый уровень — устанавливаем его явно
    if (typeof options.initialState?.level === 'number') {
      this.player.level = options.initialState.level;
    }

    if (options.freeBrasilena) this.freeBrasilena = options.freeBrasilena;

    this.images = {
      playerFrames: [new Image(), new Image()],
      playerLeft: new Image(),
      enemy: new Image(),
      enemyLeft: new Image(),
      pizza: new Image(),
      brasilena: new Image(),
      wine: new Image(),
      coin: new Image(),
      backgrounds: [],
      bossLucia: new Image(),
    };

    loadImages(this.images);
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
        `[GameEngine:debug] After 1 tick: player at x=${this.player.x}, y=${this.player.y}, grounded=${this.player.grounded}`
      );
    }, 500);

    // После всех инициализаций:
    if (typeof window !== "undefined") {
      window.gameEngineInstance = this;
    }
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
  }

  private setupEventListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        this.shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
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

  private generatePlatforms() {
    this.platforms = [
      { x: 0, y: this.canvas.height - 40, width: this.canvas.width, height: 40, color: '#F87171' },
      { x: 300, y: 350, width: 120, height: 20, color: '#7DD3FC' },
      { x: 500, y: 280, width: 100, height: 20, color: '#6EE7B7' },
      { x: 150, y: 220, width: 80, height: 20, color: '#FBBF24' },
      { x: 650, y: 200, width: 100, height: 20, color: '#A78BFA' }
    ];

    setTimeout(() => this.generateStaticSandLayer(), 0);
  }

  private drawCoral(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
    ctx.save();
    ctx.beginPath();
    let waviness = 8 + Math.random() * 20;
    ctx.moveTo(x, y + height);
    for (let i = 0; i <= width; i += 6) {
      ctx.lineTo(x + i, y + height - Math.sin(i / 17) * waviness);
    }
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y);

    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 0.97;
    ctx.fill();
    ctx.globalAlpha = 1;

    let branchCount = 2 + Math.floor(Math.random() * 4);
    for (let b = 0; b < branchCount; b++) {
      let bx = x + 16 + Math.random() * (width - 38);
      let by = y + 8 + Math.random() * (height/2);
      ctx.beginPath();
      ctx.moveTo(bx, by + height/3);
      let len = 38 + Math.random() * 40;
      let dir = (Math.random() - 0.5) * 0.8;
      ctx.bezierCurveTo(
        bx + 12*dir, by - len/1.5,
        bx + 24*dir, by - len*0.75,
        bx + 30*dir, by - len
      );
      ctx.lineWidth = 5 + Math.random() * 8;
      ctx.strokeStyle = color;
      ctx.shadowBlur = 9;
      ctx.shadowColor = "#f9fafb";
      ctx.globalAlpha = 0.95;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
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
    this.coins = [];
    this.pizzas = [];
    this.brasilenas = [];
    this.wines = [];

    // Исправлено: теперь босс появляется при уровне >= 10 (раньше было > 10)
    if (this.player.level >= 10) {
      this.bossLucia = {
        x: 300,
        y: 150,
        width: 128,
        height: 128,
        health: 200 + (this.player.level - 10) * 40,
        image: this.images?.bossLucia ?? new Image(),
        direction: 1,
      };
      // Пиццы, вино, коин можно добавлять по желанию
      for (let i = 0; i < 2; i++) {
        this.pizzas.push({
          x: 250 + Math.random() * 350,
          y: 110 + Math.random() * 200,
          width: 36,
          height: 36
        });
      }
      for (let i = 0; i < 2; i++) {
        this.wines.push({
          x: 260 + Math.random() * 320,
          y: 130 + Math.random() * 140,
          width: 32,
          height: 32
        });
      }
      // Обычные монеты не спавним на босс-уровне!
      // for (let i = 0; i < 4; i++) {
      //   this.coins.push({
      //     x: 200 + Math.random() * 400,
      //     y: 100 + Math.random() * 200,
      //     width: 32,
      //     height: 32
      //   });
      // }
      return;
    } else {
      this.bossLucia = null;
    }

    // Обычные уровни
    const enemyCount = 3 + this.player.level;
    const coinCount = 5 + this.player.level * 2;

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

    for (let i = 0; i < coinCount; i++) {
      this.coins.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
        height: 32
      });
    }

    for (let i = 0; i < 3; i++) {
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
    for (let i = 0; i < 2; i++) {
      this.brasilenas.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: slimBonusWidth,
        height: tallBonusHeight
      });

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

  private shoot() {
    const currentTime = Date.now();
    if (this.player.ammo <= 0 || currentTime - this.lastShotTime < this.SHOT_COOLDOWN) {
      return;
    }
    const direction = typeof this.player.direction === "number" ? this.player.direction : 1;

    this.bullets.push({
      x: direction === 1 ? this.player.x + this.player.width : this.player.x - 20,
      y: this.player.y + this.player.height / 2 - 5,
      width: 20,
      height: 10,
      speed: 10 * direction,
      direction
    });

    this.player.ammo--;
    this.lastShotTime = currentTime;
    this.updateGameState();
  }

  private updateGameState() {
    // --- score удаляем полностью
    if (isGodmodeActive(this.godmode)) {
      applyGodmodeIfNeeded(this.player, this.godmode);
    }
    this.callbacks.onStateUpdate({
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      level: this.player.level
      // без score!
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
    this.generateLevel();
    this.updateGameState();
  }

  public start() {
    console.log('Starting game engine...');
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
    this.bossCoinTimer = window.setTimeout(() => {
      // По завершении времени — удалить только босс-монеты
      this.coins = this.coins.filter(coin => !coin._bossCoin);
      this.bossRewardActive = false;
      this.bossCoinsEndTime = null;
      this.bossCoinTimer = null;
      this.updateGameState();
    }, 10000);

    // Сразу обновим UI (монет становится много)
    this.updateGameState();
  }

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
}

import { drawPixelCoral } from './drawPixelCoral';
import { drawPixelSand } from './drawPixelSand';
import { createStaticSandLayer } from './staticSandLayer';
