export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private keys: { [key: string]: boolean } = {};
  private lastShotTime = 0;
  private readonly SHOT_COOLDOWN = 200; // milliseconds between shots

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
    level: 1
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

  private collectibles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'coin' | 'pizza' | 'brasilena' | 'wine';
  }> = [];

  private platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  private images: { [key: string]: HTMLImageElement } = {};

  private callbacks: {
    onGameEnd: (victory: boolean, finalStats: any) => void;
    onStateUpdate: (updates: any) => void;
  };

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
    this.callbacks = options;
    
    // Apply initial state
    Object.assign(this.player, options.initialState);
    
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
      pizza: '/lovable-uploads/60af68f1-3f70-4928-8512-4f13c4e56a05.png'
    };

    Object.entries(imageUrls).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => console.log(`Loaded image: ${key}`);
      img.onerror = () => console.error(`Failed to load image: ${key}`);
      this.images[key] = img;
    });
  }

  private setupEventListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.code] = true;
      
      // Handle shooting with space - separate from movement
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

  private generatePlatforms() {
    this.platforms = [
      // Ground
      { x: 0, y: this.canvas.height - 40, width: this.canvas.width, height: 40 },
      // Platforms
      { x: 300, y: 350, width: 120, height: 20 },
      { x: 500, y: 280, width: 100, height: 20 },
      { x: 150, y: 220, width: 80, height: 20 },
      { x: 650, y: 200, width: 100, height: 20 }
    ];
  }

  private generateLevel() {
    this.enemies = [];
    this.collectibles = [];

    // Generate enemies
    for (let i = 0; i < 3 + this.player.level; i++) {
      this.enemies.push({
        x: 400 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        width: 48,
        height: 48,
        speed: 1 + this.player.level * 0.2
      });
    }

    // Generate collectibles
    const collectibleTypes: Array<'coin' | 'pizza' | 'brasilena' | 'wine'> = ['coin', 'coin', 'coin', 'pizza', 'brasilena', 'wine'];
    
    for (let i = 0; i < 6; i++) {
      this.collectibles.push({
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        width: 32,
        height: 32,
        type: collectibleTypes[i % collectibleTypes.length]
      });
    }
  }

  private updatePlayer() {
    // Gravity
    this.player.velY += 0.8;

    // Horizontal movement
    this.player.velX = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.player.velX = -this.player.speed;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player.velX = this.player.speed;
    }

    // Jumping - use W or Up arrow, NOT space
    if ((this.keys['KeyW'] || this.keys['ArrowUp']) && this.player.grounded) {
      this.player.velY = this.player.jumpPower;
      this.player.grounded = false;
    }

    // Apply velocity
    this.player.x += this.player.velX;
    this.player.y += this.player.velY;

    // Boundary checks
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }

    // Platform collisions
    this.player.grounded = false;
    for (const platform of this.platforms) {
      if (this.checkCollision(this.player, platform) && this.player.velY >= 0) {
        if (this.player.y + this.player.height <= platform.y + 10) {
          this.player.y = platform.y - this.player.height;
          this.player.velY = 0;
          this.player.grounded = true;
        }
      }
    }

    // Check collectible collisions
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      if (this.checkCollision(this.player, collectible)) {
        this.handleCollectible(collectible.type);
        this.collectibles.splice(i, 1);
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
  }

  private handleCollectible(type: string) {
    switch (type) {
      case 'coin':
        this.player.coins++;
        break;
      case 'pizza':
        this.player.health = Math.min(this.player.health + 20, 100);
        break;
      case 'brasilena':
        this.player.ammo += 10;
        break;
      case 'wine':
        this.player.speed = Math.min(this.player.speed + 2, 10);
        setTimeout(() => { this.player.speed = 5; }, 5000);
        break;
    }
    this.updateGameState();
  }

  private updateEnemies() {
    this.enemies.forEach(enemy => {
      // Simple AI - move towards player
      if (enemy.x > this.player.x) {
        enemy.x -= enemy.speed;
      } else {
        enemy.x += enemy.speed;
      }
      
      // Keep enemies on screen
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

      // Remove bullets that are off screen
      if (bullet.x > this.canvas.width) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check bullet-enemy collisions
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
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a2980');
    gradient.addColorStop(1, '#26d0ce');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms
    this.ctx.fillStyle = '#8B4513';
    this.platforms.forEach(platform => {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player with animation
    const playerImage = Date.now() % 1000 < 500 ? this.images.player1 : this.images.player2;
    if (playerImage && playerImage.complete) {
      this.ctx.drawImage(playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
    } else {
      // Fallback rectangle
      this.ctx.fillStyle = '#3498db';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    // Draw enemies
    this.ctx.fillStyle = '#e74c3c';
    this.enemies.forEach(enemy => {
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw bullets
    this.ctx.fillStyle = '#f39c12';
    this.bullets.forEach(bullet => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw collectibles
    this.collectibles.forEach(collectible => {
      const image = this.images[collectible.type];
      if (image && image.complete) {
        this.ctx.drawImage(image, collectible.x, collectible.y, collectible.width, collectible.height);
      } else {
        // Fallback colors
        const colors = { coin: '#f1c40f', pizza: '#e74c3c', brasilena: '#8e44ad', wine: '#c0392b' };
        this.ctx.fillStyle = colors[collectible.type];
        this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
      }
    });

    // Check win condition
    if (this.enemies.length === 0 && this.collectibles.filter(c => c.type === 'coin').length === 0) {
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
