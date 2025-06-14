import { GameState } from './types';
import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
import { handleEnemyCollisions } from './collisionHandlers';
import { useFreeBrasilena } from './useFreeBrasilena';

import { updatePlayer } from './player';
import { updateEnemies } from './enemies';
import { handleBonuses } from './bonuses';
import { updateBullets } from './bullets';
import { updateBubbles, drawBubbles, drawPlatforms } from './environment';
import { checkCollision } from './utils/collision';

import { renderScene } from './renderer';
import { gameTick } from './loop';
import { loadImages } from './imageLoader';
import { generateBubbles, updateBubbles, drawBubbles } from './bubblesManager';
import { createDefaultPlatforms } from './platformsManager';
import { setupKeyboardHandlers } from './controlsManager';

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

  private coins: Array<{ x: number; y: number; width: number; height: number }> = [];
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

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: {
      onGameEnd: (victory: boolean, finalStats: any) => void;
      onStateUpdate: (updates: any) => void;
      initialState: any;
      freeBrasilena?: ReturnType<typeof useFreeBrasilena>;
    }
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.callbacks = options;

    Object.assign(this.player, options.initialState);

    // Протаскиваем логин (username) в player, если есть
    if (options.initialState && options.initialState.username) {
      this.player.username = options.initialState.username;
    }

    if (options.initialState?.markJump) {
      this.player.jumpPower = -15;
    } else {
      this.player.jumpPower = -15;
    }

    this.godmode = !!(options.initialState && options.initialState.godmode);
    applyGodmodeIfNeeded(this.player, this.godmode);
    if (this.godmode) {
      this.player.health = 100;
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
  }

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

  private generateBubbles() {
    if (this.bubbles.length < 100) {
      this.bubbles.push({
        x: 8 + Math.random() * (this.canvas.width - 16),
        y: this.canvas.height + Math.random() * 20,
        radius: 1.5 + Math.random() * 5.5,
        speed: 0.7 + Math.random() * 1.3,
        drift: (Math.random() - 0.5) * 0.35,
        driftPhase: Math.random() * Math.PI * 2,
        alpha: 0.15 + Math.random() * 0.7
      });
    }
  }

  private updateBubbles() {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= b.speed;
      b.x += Math.sin(Date.now() * 0.001 + b.driftPhase) * b.drift;
      b.alpha = Math.max(0.05, b.alpha - 0.0008);
      if (b.y + b.radius < 0 || b.x < -10 || b.x > this.canvas.width + 10) {
        this.bubbles.splice(i, 1);
      }
    }
    this.generateBubbles();
  }

  private drawBubbles(ctx: CanvasRenderingContext2D) {
    for (const b of this.bubbles) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = b.radius > 4 ? '#e0f7fa' : (Math.random() > 0.6 ? '#b9eafe' : '#d1f5fa');
      ctx.shadowColor = '#bcf3f9';
      ctx.shadowBlur = b.radius > 3 ? 8 : 2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
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

  private generateLevel() {
    if (this.freeBrasilena && typeof this.freeBrasilena.reset === "function") {
      this.freeBrasilena.reset();
    }

    this.enemies = [];
    this.coins = [];
    this.pizzas = [];
    this.brasilenas = [];
    this.wines = [];

    // Отдельно обрабатываем босса для 11+ уровней
    if (this.player.level > 10) {
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
      for (let i = 0; i < 4; i++) {
        this.coins.push({
          x: 200 + Math.random() * 400,
          y: 100 + Math.random() * 200,
          width: 32,
          height: 32
        });
      }
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
    if (isGodmodeActive(this.godmode)) {
      applyGodmodeIfNeeded(this.player, this.godmode);
    }
    this.callbacks.onStateUpdate({
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      level: this.player.level
    });
  }

  private gameLoop = () => {
    gameTick(this);
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

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
}

import { drawPixelCoral } from './drawPixelCoral';
import { drawPixelSand } from './drawPixelSand';
import { createStaticSandLayer } from './staticSandLayer';
