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
  };

  private bullets: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
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
    enemy: HTMLImageElement;
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

    if (options.initialState?.markJump) {
      this.player.jumpPower = -44;
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
      enemy: new Image(),
      pizza: new Image(),
      brasilena: new Image(),
      wine: new Image(),
      coin: new Image(),
      backgrounds: [],
      bossLucia: new Image(),
    };

    this.loadImages();
    this.setupEventListeners();
    this.generateLevel();
    this.generatePlatforms();
  }

  private loadImages() {
    const imageUrls = {
      player1: '/lovable-uploads/d62d1b89-98ee-462d-bbc4-37715a91950f.png',
      player2: '/lovable-uploads/00354654-8e2c-4993-8167-a9e91aef0d44.png',
      coin: '/lovable-uploads/8cb50a4f-d767-4a5d-bdf6-751db3255aec.png',
      brasilena: '/lovable-uploads/cc5bbfd2-9663-470b-8edf-b5314b29b3f0.png',
      wine: '/lovable-uploads/989f5507-8b03-451b-b9c1-b0e2d1cc1aaa.png',
      pizza: '/lovable-uploads/204b20b0-06cb-45cd-b3e7-8a94e658a065.png', // <-- обновленный спрайт пиццы!
      enemy: '/lovable-uploads/b0b2972b-c98d-4f17-bf93-ac419c59bc60.png',
      bossLucia: '/lovable-uploads/e2e9e94b-84f9-450f-a422-4f25b84dc5c0.png',
    };

    this.images.playerFrames[0].src = imageUrls.player1;
    this.images.playerFrames[1].src = imageUrls.player2;
    this.images.enemy.src = imageUrls.enemy;
    this.images.pizza.src = imageUrls.pizza;
    this.images.brasilena.src = imageUrls.brasilena;
    this.images.wine.src = imageUrls.wine;
    this.images.coin.src = imageUrls.coin;
    this.images.bossLucia.src = imageUrls.bossLucia;

    Object.entries(imageUrls).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => console.log(`Loaded image: ${key}`);
      img.onerror = () => console.error(`Failed to load image: ${key}`);
    });
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

    for (let i = 0; i < enemyCount; i++) {
      this.enemies.push({
        x: 400 + Math.random() * 300,
        y: 100 + Math.random() * 200,
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

    // Бонус "Бразильена" и "Вино" — делаем шире (42px)
    const bigBonusWidth = 42;
    for (let i = 0; i < 2; i++) {
      this.brasilenas.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: bigBonusWidth,
        height: 32
      });

      this.wines.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: bigBonusWidth,
        height: 32
      });
    }
  }

  private shoot() {
    const currentTime = Date.now();
    if (this.player.ammo <= 0 || currentTime - this.lastShotTime < this.SHOT_COOLDOWN) {
      return;
    }

    this.bullets.push({
      x: this.player.x + this.player.width,
      y: this.player.y + this.player.height / 2 - 5,
      width: 20,
      height: 10,
      speed: 10
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

  private render() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#084e82");
    gradient.addColorStop(0.28, "#1e3a8a");
    gradient.addColorStop(0.55, "#2d6cbb");
    gradient.addColorStop(0.77, "#60a5fa");
    gradient.addColorStop(1, "#8bf0ff");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateBubbles();
    this.drawBubbles(this.ctx);

    this.platforms.forEach((platform) => {
      if (platform.y >= this.canvas.height - 40 - 1) {
        if (this.staticSandLayer) {
          this.ctx.drawImage(
            this.staticSandLayer,
            0,
            0,
            platform.width,
            platform.height,
            platform.x,
            platform.y,
            platform.width,
            platform.height
          );
        } else {
          drawPixelSand(
            this.ctx,
            platform.x,
            platform.y,
            platform.width,
            platform.height
          );
        }
      } else {
        drawPixelCoral(
          this.ctx,
          platform.x,
          platform.y,
          platform.width,
          platform.height,
          ['#ea866c', '#e7b76a', '#fcf596', '#89f4fb']
        );
      }
    });

    // Игрок
    const playerImage = this.images.playerFrames[this.player.frame];
    if (playerImage && playerImage.complete) {
      this.ctx.drawImage(playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
    } else {
      this.ctx.fillStyle = '#3498db';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    // Обычные враги или босс
    if (this.bossLucia) {
      const image = this.images.bossLucia;
      if (image && image.complete) {
        this.ctx.drawImage(image, this.bossLucia.x, this.bossLucia.y, this.bossLucia.width, this.bossLucia.height);
      } else {
        this.ctx.fillStyle = "#AA2424";
        this.ctx.fillRect(this.bossLucia.x, this.bossLucia.y, this.bossLucia.width, this.bossLucia.height);
      }
      // Отрисуем полоску хп босса
      this.ctx.save();
      this.ctx.globalAlpha = 0.86;
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(this.bossLucia.x, this.bossLucia.y - 18, this.bossLucia.width, 10);
      this.ctx.fillStyle = "#fcba03";
      this.ctx.fillRect(this.bossLucia.x, this.bossLucia.y - 18, (this.bossLucia.health / (200 + (this.player.level - 10) * 40)) * this.bossLucia.width, 10);
      this.ctx.restore();
    } else {
      this.enemies.forEach(enemy => {
        const image = this.images.enemy;
        if (image && image.complete) {
          this.ctx.drawImage(image, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          this.ctx.fillStyle = '#e74c3c';
          this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
      });
    }

    // Стрельба - как раньше
    this.ctx.fillStyle = '#f39c12';
    this.bullets.forEach(bullet => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Монетки
    this.coins.forEach(coin => {
      const image = this.images.coin;
      if (image && image.complete) {
        this.ctx.drawImage(image, coin.x, coin.y, coin.width, coin.height);
      } else {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
      }
    });

    // Пиццы: корректный рендеринг спрайта
    this.pizzas.forEach(pizza => {
      const image = this.images.pizza;
      if (image && image.complete && pizza.width && pizza.height) {
        this.ctx.drawImage(image, pizza.x, pizza.y, pizza.width, pizza.height);
      } else {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(pizza.x, pizza.y, pizza.width, pizza.height);
      }
    });

    // Бонусы Brasilena (42px ширина)
    this.brasilenas.forEach(brasilena => {
      const image = this.images.brasilena;
      if (image && image.complete) {
        this.ctx.drawImage(
          image,
          0, 0, image.width, image.height,
          brasilena.x, brasilena.y,
          brasilena.width, brasilena.height
        );
      } else {
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.fillRect(brasilena.x, brasilena.y, brasilena.width, brasilena.height);
      }
    });

    // Бонусы Wine (42px ширина)
    this.wines.forEach(wine => {
      const image = this.images.wine;
      if (image && image.complete) {
        this.ctx.drawImage(
          image,
          0, 0, image.width, image.height,
          wine.x, wine.y,
          wine.width, wine.height
        );
      } else {
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(wine.x, wine.y, wine.width, wine.height);
      }
    });

    // Логика перехода уровней — теперь с учётом босса
    if (!this.bossLucia && this.enemies.length === 0 && this.coins.filter(c => c).length === 0) {
      this.player.level++;
      // После 10 уровня — босс
      if (this.player.level > 10) {
        this.generateLevel();
        this.updateGameState();
        return;
      }
      if (this.player.level > 10) {
        // Не должно доходить, но на всякий случай
        this.callbacks.onGameEnd(true, {
          level: this.player.level,
          coins: this.player.coins,
          score: this.player.coins * 10 + this.player.level * 100
        });
        return;
      }
      this.generateLevel();
      this.updateGameState();
    }
  }

  private gameLoop = () => {
    updatePlayer({
      player: this.player,
      platforms: this.platforms,
      coins: this.coins,
      pizzas: this.pizzas,
      brasilenas: this.brasilenas,
      wines: this.wines,
      freeBrasilena: this.freeBrasilena,
      canvas: this.canvas,
      mobileControlState: this.mobileControlState,
      keys: this.keys,
      callbacks: this.callbacks
    });
    updateEnemies({
      bossLucia: this.bossLucia,
      enemies: this.enemies,
      player: this.player,
      canvas: this.canvas,
      callbacks: this.callbacks,
      checkCollision,
      godmode: this.godmode
    });
    handleBonuses({
      player: this.player,
      pizzas: this.pizzas,
      brasilenas: this.brasilenas,
      wines: this.wines,
      freeBrasilena: this.freeBrasilena,
      callbacks: this.callbacks,
      checkCollision,
      spawnBrasilenaWidth: 42, // Ширина 42px!
      spawnBrasilenaHeight: 32
    });
    updateBullets({
      bullets: this.bullets,
      enemies: this.enemies,
      bossLucia: this.bossLucia,
      player: this.player,
      callbacks: this.callbacks,
      checkCollision,
      canvas: this.canvas
    });
    updateBubbles(this.bubbles, this.canvas);
    this.render();
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
