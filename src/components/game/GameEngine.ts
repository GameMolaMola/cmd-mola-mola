import { GameState } from './types';

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

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: {
      onGameEnd: (victory: boolean, finalStats: any) => void;
      onStateUpdate: (updates: any) => void;
      initialState: any;
    }
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.callbacks = options;

    // Apply initial state
    Object.assign(this.player, options.initialState);

    this.images = {
      playerFrames: [new Image(), new Image()],
      enemy: new Image(),
      pizza: new Image(),
      brasilena: new Image(),
      wine: new Image(),
      coin: new Image(),
      backgrounds: [],
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
      brasilena: '/lovable-uploads/2d15af34-fad3-4789-80a2-b0f9d9a204a0.png',
      wine: '/lovable-uploads/9132b9d8-ab25-44a7-81ec-031ebfbb97e6.png',
      pizza: '/lovable-uploads/60af68f1-3f70-4928-8512-4f13c4e56a05.png',
      enemy: '/lovable-uploads/ee8156f0-ed84-469d-b314-13a6aa436d63.png'
    };

    this.images.playerFrames[0].src = imageUrls.player1;
    this.images.playerFrames[1].src = imageUrls.player2;
    this.images.enemy.src = imageUrls.enemy;
    this.images.pizza.src = imageUrls.pizza;
    this.images.brasilena.src = imageUrls.brasilena;
    this.images.wine.src = imageUrls.wine;
    this.images.coin.src = imageUrls.coin;

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

  private generatePlatforms() {
    // Позиции платформ останутся прежними, но теперь визуализируем их как кораллы
    this.platforms = [
      { x: 0, y: this.canvas.height - 40, width: this.canvas.width, height: 40, color: '#F87171' },
      { x: 300, y: 350, width: 120, height: 20, color: '#7DD3FC' },
      { x: 500, y: 280, width: 100, height: 20, color: '#6EE7B7' },
      { x: 150, y: 220, width: 80, height: 20, color: '#FBBF24' },
      { x: 650, y: 200, width: 100, height: 20, color: '#A78BFA' }
    ];
  }

  private generateBubbles() {
    // Cоздаем до 100 пузырьков
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
    // Много мелких пузырьков разного цвета и размера
    for (const b of this.bubbles) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, false);
      // Немного белесых и голубых пузырей
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

    // Коралловые веточки (больше и длиннее)
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
    this.enemies = [];
    this.coins = [];
    this.pizzas = [];
    this.brasilenas = [];
    this.wines = [];

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

    for (let i = 0; i < 2; i++) {
      this.brasilenas.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
        height: 32
      });

      this.wines.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
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

  private updatePlayer() {
    // Приоритет отдаем мобильному управлению, если оно активно
    let left = this.keys['KeyA'] || this.keys['ArrowLeft'] || !!this.mobileControlState['left'];
    let right = this.keys['KeyD'] || this.keys['ArrowRight'] || !!this.mobileControlState['right'];
    let jump = (this.keys['KeyW'] || this.keys['ArrowUp'] || !!this.mobileControlState['jump']);
    
    this.player.velY += 0.8;
    this.player.velX = 0;
    if (left) this.player.velX = -this.player.speed;
    if (right) this.player.velX = this.player.speed;

    // Анимация
    if (this.player.velX !== 0 && this.player.grounded) {
      this.player.frameTimer++;
      if (this.player.frameTimer >= (60 / this.player.frameRate)) {
        this.player.frame = (this.player.frame + 1) % this.images.playerFrames.length;
        this.player.frameTimer = 0;
      }
    } else {
      this.player.frame = 0;
      this.player.frameTimer = 0;
    }

    if (jump && this.player.grounded) {
      this.player.velY = this.player.jumpPower;
      this.player.grounded = false;
    }

    // Стрельба на мобильном ("fire" — автоматом разово, как Space)
    if (this.mobileControlState['fire']) {
      this.shoot();
      this.mobileControlState['fire'] = false;
    }

    this.player.x += this.player.velX;
    this.player.y += this.player.velY;

    // Ограничения по границам экрана
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }

    // --- Главная правка: КОРРЕКТНАЯ КОЛЛИЗИЯ С ПЛАТФОРМАМИ (приземление СВЕРХУ, нет сквозного пролёта) ---
    // Ищем платформу ниже (на которую можем встать)
    let landed = false;
    for (const platform of this.platforms) {
      const prevBottom = this.player.y + this.player.height - this.player.velY; // положение до перемещения
      const currBottom = this.player.y + this.player.height;
      // Условие: снизу приближались к платформе, попали в диапазон x платформы
      if (
        prevBottom <= platform.y && // было выше платформы
        currBottom >= platform.y && // стало ниже/касается платформы
        this.player.x + this.player.width > platform.x + 8 && // покрытие по X
        this.player.x < platform.x + platform.width - 8 &&
        this.player.velY >= 0
      ) {
        // Ставим чётко на платформу
        this.player.y = platform.y - this.player.height;
        this.player.velY = 0;
        this.player.grounded = true;
        landed = true;
        break;
      }
    }
    if (!landed) this.player.grounded = false;

    // Check collectible collisions
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (this.checkCollision(this.player, coin)) {
        this.player.coins++;
        this.coins.splice(i, 1);
        this.updateGameState();
      }
    }

    for (let i = this.pizzas.length - 1; i >= 0; i--) {
      const pizza = this.pizzas[i];
      if (this.checkCollision(this.player, pizza)) {
        this.player.health = Math.min(this.player.health + 20, 100);
        this.pizzas.splice(i, 1);
        this.updateGameState();
      }
    }

    for (let i = this.brasilenas.length - 1; i >= 0; i--) {
      const brasilena = this.brasilenas[i];
      if (this.checkCollision(this.player, brasilena)) {
        this.player.ammo += 10;
        this.brasilenas.splice(i, 1);
        this.updateGameState();
      }
    }

    for (let i = this.wines.length - 1; i >= 0; i--) {
      const wine = this.wines[i];
      if (this.checkCollision(this.player, wine)) {
        this.player.powerUps.speedBoost = true;
        this.player.powerUps.speedBoostTime = 300;
        this.player.speed = 8;
        this.wines.splice(i, 1);
        this.updateGameState();
      }
    }

    // Check enemy collisions
    for (const enemy of this.enemies) {
      if (this.checkCollision(this.player, enemy)) {
        this.player.health -= 2;
        this.updateGameState();
        if (this.player.health <= 0) {
          this.callbacks.onGameEnd(false, { 
            level: this.player.level, 
            coins: this.player.coins, 
            score: this.player.coins * 10 
          });
          return;
        }
      }
    }

    // Update power-ups
    if (this.player.powerUps.speedBoost) {
      this.player.powerUps.speedBoostTime--;
      if (this.player.powerUps.speedBoostTime <= 0) {
        this.player.powerUps.speedBoost = false;
        this.player.speed = 5;
        this.updateGameState();
      }
    }
  }

  private updateEnemies() {
    this.enemies.forEach(enemy => {
      if (enemy.x > this.player.x) {
        enemy.x -= enemy.speed;
      } else {
        enemy.x += enemy.speed;
      }
      
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > this.canvas.width) {
        enemy.x = this.canvas.width - enemy.width;
      }
    });
  }

  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.speed;

      if (bullet.x > this.canvas.width) {
        this.bullets.splice(i, 1);
        continue;
      }

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (this.checkCollision(bullet, enemy)) {
          this.enemies.splice(j, 1);
          this.bullets.splice(i, 1);
          this.player.coins += 2;
          this.updateGameState();
          break;
        }
      }
    }
  }

  private checkCollision(rect1: any, rect2: any): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  private updateGameState() {
    this.callbacks.onStateUpdate({
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      level: this.player.level
    });
  }

  private render() {
    // КРАСИВЫЙ морской градиент
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#084e82");
    gradient.addColorStop(0.28, "#1e3a8a");
    gradient.addColorStop(0.55, "#2d6cbb");
    gradient.addColorStop(0.77, "#60a5fa");
    gradient.addColorStop(1, "#8bf0ff");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // --- Много пузырьков до платформ ---
    this.updateBubbles();
    this.drawBubbles(this.ctx);

    // --- Коралловые платформы ---
    this.platforms.forEach(platform => {
      this.drawCoral(this.ctx, platform.x, platform.y, platform.width, platform.height, platform.color);
    });

    const playerImage = this.images.playerFrames[this.player.frame];
    if (playerImage && playerImage.complete) {
      this.ctx.drawImage(playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
    } else {
      this.ctx.fillStyle = '#3498db';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    // Враги — рисуем картинку медузы
    this.enemies.forEach(enemy => {
      const image = this.images.enemy;
      if (image && image.complete) {
        this.ctx.drawImage(image, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });

    this.ctx.fillStyle = '#f39c12';
    this.bullets.forEach(bullet => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    this.coins.forEach(coin => {
      const image = this.images.coin;
      if (image && image.complete) {
        this.ctx.drawImage(image, coin.x, coin.y, coin.width, coin.height);
      } else {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
      }
    });

    this.pizzas.forEach(pizza => {
      const image = this.images.pizza;
      if (image && image.complete) {
        this.ctx.drawImage(image, pizza.x, pizza.y, pizza.width, pizza.height);
      } else {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(pizza.x, pizza.y, pizza.width, pizza.height);
      }
    });

    this.brasilenas.forEach(brasilena => {
      const image = this.images.brasilena;
      if (image && image.complete) {
        this.ctx.drawImage(image, brasilena.x, brasilena.y, brasilena.width, brasilena.height);
      } else {
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.fillRect(brasilena.x, brasilena.y, brasilena.width, brasilena.height);
      }
    });

    this.wines.forEach(wine => {
      const image = this.images.wine;
      if (image && image.complete) {
        this.ctx.drawImage(image, wine.x, wine.y, wine.width, wine.height);
      } else {
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(wine.x, wine.y, wine.width, wine.height);
      }
    });

    if (this.enemies.length === 0 && this.coins.filter(c => c).length === 0) {
      this.player.level++;
      if (this.player.level > 10) {
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
    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();
    this.render();
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    console.log('Starting game engine...');
    this.gameLoop();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
