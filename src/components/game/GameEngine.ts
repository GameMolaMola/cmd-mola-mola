import { GameState } from './MolaMolaGame';

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velX?: number;
  velY?: number;
}

export interface Player extends GameObject {
  speed: number;
  jumping: boolean;
  grounded: boolean;
  health: number;
  ammo: number;
  coins: number;
  level: number;
  powerUps: {
    speedBoost: boolean;
    speedBoostTime: number;
  };
}

export interface Bullet extends GameObject {
  speed: number;
  color: string;
}

export interface Enemy extends GameObject {
  speed: number;
  health: number;
}

export interface Collectible extends GameObject {
  type: 'coin' | 'pizza' | 'brasilena' | 'wine';
  collected: boolean;
}

export interface Platform extends GameObject {
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private keys: { [key: string]: boolean } = {};
  
  private player: Player;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private collectibles: Collectible[] = [];
  private platforms: Platform[] = [];
  
  private camera = { x: 0, y: 0 };
  private gameCallbacks: {
    onGameEnd: (victory: boolean, finalStats: Partial<GameState>) => void;
    onStateUpdate: (updates: Partial<GameState>) => void;
    initialState: GameState;
  };

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    callbacks: {
      onGameEnd: (victory: boolean, finalStats: Partial<GameState>) => void;
      onStateUpdate: (updates: Partial<GameState>) => void;
      initialState: GameState;
    }
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gameCallbacks = callbacks;
    
    // Initialize player
    this.player = {
      x: 100,
      y: this.canvas.height - 150,
      width: 60,
      height: 60,
      speed: 5,
      velX: 0,
      velY: 0,
      jumping: false,
      grounded: false,
      health: callbacks.initialState.health,
      ammo: callbacks.initialState.ammo,
      coins: callbacks.initialState.coins,
      level: callbacks.initialState.level,
      powerUps: {
        speedBoost: false,
        speedBoostTime: 0
      }
    };

    this.setupEventListeners();
    this.generateLevel(this.player.level);
  }

  private setupEventListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && this.player.ammo > 0) {
        this.shoot();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  private generateLevel(level: number) {
    // Clear existing objects
    this.enemies = [];
    this.collectibles = [];
    this.platforms = [];

    // Generate platforms
    this.platforms.push({
      x: 0,
      y: this.canvas.height - 40,
      width: this.canvas.width * 3, // Extended world
      height: 40,
      color: '#8B4513'
    });

    // Generate floating platforms
    const platformCount = 5 + level * 2;
    for (let i = 0; i < platformCount; i++) {
      this.platforms.push({
        x: 200 + i * 150 + Math.random() * 100,
        y: 100 + Math.random() * 250,
        width: 80 + Math.random() * 70,
        height: 16,
        color: i % 2 ? '#2E8B57' : '#1E90FF'
      });
    }

    // Generate enemies
    const enemyCount = 5 + level * 2;
    for (let i = 0; i < enemyCount; i++) {
      this.enemies.push({
        x: 400 + i * 200 + Math.random() * 100,
        y: Math.random() * (this.canvas.height - 200) + 100,
        width: 48,
        height: 48,
        velX: 0,
        velY: 0,
        speed: 1 + level * 0.2,
        health: 1
      });
    }

    // Generate collectibles
    const collectibleTypes: Array<'coin' | 'pizza' | 'brasilena' | 'wine'> = ['coin', 'pizza', 'brasilena', 'wine'];
    const collectibleCount = 15 + level * 3;
    
    for (let i = 0; i < collectibleCount; i++) {
      const type = i < 10 ? 'coin' : collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
      this.collectibles.push({
        x: 200 + i * 100 + Math.random() * 50,
        y: Math.random() * (this.canvas.height - 200) + 50,
        width: 32,
        height: 32,
        type,
        collected: false
      });
    }
  }

  private shoot() {
    if (this.player.ammo <= 0) return;

    this.bullets.push({
      x: this.player.x + this.player.width,
      y: this.player.y + this.player.height / 2 - 5,
      width: 20,
      height: 10,
      speed: 10,
      color: '#3498db'
    });

    this.player.ammo--;
    this.updateGameState();
  }

  private updatePlayer() {
    // Gravity
    this.player.velY = (this.player.velY || 0) + 0.5;

    // Input handling
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.player.velX = -this.player.speed;
    } else if (this.keys['d'] || this.keys['arrowright']) {
      this.player.velX = this.player.speed;
    } else {
      this.player.velX = 0;
    }

    // Jumping
    if ((this.keys['w'] || this.keys['arrowup'] || this.keys[' ']) && this.player.grounded) {
      this.player.velY = -15;
      this.player.jumping = true;
      this.player.grounded = false;
    }

    // Apply velocity
    this.player.x += this.player.velX || 0;
    this.player.y += this.player.velY || 0;

    // Boundaries
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y + this.player.height > this.canvas.height) {
      this.player.y = this.canvas.height - this.player.height;
      this.player.grounded = true;
      this.player.velY = 0;
    }

    // Platform collisions
    this.checkPlatformCollisions();
    
    // Enemy collisions
    this.checkEnemyCollisions();
    
    // Collectible collisions
    this.checkCollectibleCollisions();

    // Update camera to follow player
    this.camera.x = Math.max(0, this.player.x - this.canvas.width / 2);

    // Update power-ups
    if (this.player.powerUps.speedBoost) {
      this.player.powerUps.speedBoostTime--;
      if (this.player.powerUps.speedBoostTime <= 0) {
        this.player.powerUps.speedBoost = false;
        this.player.speed = 5;
      }
    }
  }

  private checkPlatformCollisions() {
    this.player.grounded = false;
    
    this.platforms.forEach(platform => {
      if (
        this.player.x < platform.x + platform.width &&
        this.player.x + this.player.width > platform.x &&
        this.player.y + this.player.height <= platform.y &&
        this.player.y + this.player.height + (this.player.velY || 0) > platform.y
      ) {
        this.player.y = platform.y - this.player.height;
        this.player.velY = 0;
        this.player.grounded = true;
      }
    });
  }

  private checkEnemyCollisions() {
    this.enemies.forEach(enemy => {
      if (this.isColliding(this.player, enemy)) {
        this.player.health -= 2;
        this.updateGameState();
        
        // Knockback
        if (this.player.x < enemy.x) {
          this.player.x -= 20;
        } else {
          this.player.x += 20;
        }
        
        if (this.player.health <= 0) {
          this.endGame(false);
        }
      }
    });
  }

  private checkCollectibleCollisions() {
    this.collectibles.forEach((collectible, index) => {
      if (!collectible.collected && this.isColliding(this.player, collectible)) {
        collectible.collected = true;
        
        switch (collectible.type) {
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
            this.player.powerUps.speedBoost = true;
            this.player.powerUps.speedBoostTime = 300;
            this.player.speed = 8;
            break;
        }
        
        this.collectibles.splice(index, 1);
        this.updateGameState();
      }
    });
  }

  private updateEnemies() {
    this.enemies.forEach(enemy => {
      // Simple AI: move towards player
      if (enemy.x < this.player.x) {
        enemy.x += enemy.speed;
      } else {
        enemy.x -= enemy.speed;
      }
      
      // Keep enemies on screen
      if (enemy.x < this.camera.x - 100) {
        enemy.x = this.camera.x + this.canvas.width + 50;
      }
    });
  }

  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.speed;
      
      // Remove bullets that are off screen
      if (bullet.x > this.camera.x + this.canvas.width + 100) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Check bullet-enemy collisions
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (this.isColliding(bullet, enemy)) {
          this.enemies.splice(j, 1);
          this.bullets.splice(i, 1);
          this.player.coins += 2;
          this.updateGameState();
          break;
        }
      }
    }
  }

  private isColliding(obj1: GameObject, obj2: GameObject): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  private updateGameState() {
    this.gameCallbacks.onStateUpdate({
      level: this.player.level,
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      score: this.player.coins * 10 + this.player.level * 100
    });
  }

  private endGame(victory: boolean) {
    this.gameCallbacks.onGameEnd(victory, {
      level: this.player.level,
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      score: this.player.coins * 10 + this.player.level * 100
    });
  }

  private draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a2980';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context for camera transform
    this.ctx.save();
    this.ctx.translate(-this.camera.x, 0);

    // Draw underwater background effects
    this.drawBackground();

    // Draw platforms
    this.platforms.forEach(platform => {
      this.ctx.fillStyle = platform.color;
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw collectibles
    this.collectibles.forEach(collectible => {
      if (!collectible.collected) {
        this.drawCollectible(collectible);
      }
    });

    // Draw enemies
    this.enemies.forEach(enemy => {
      this.drawEnemy(enemy);
    });

    // Draw bullets
    this.bullets.forEach(bullet => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw player
    this.drawPlayer();

    // Restore context
    this.ctx.restore();
  }

  private drawBackground() {
    // Draw animated bubbles
    const time = Date.now() * 0.001;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    
    for (let i = 0; i < 50; i++) {
      const x = (this.camera.x * 0.1 + i * 100 + Math.sin(time + i) * 20) % (this.canvas.width + this.camera.x + 200);
      const y = (time * 30 + i * 50) % (this.canvas.height + 100);
      const size = 2 + Math.sin(time + i) * 2;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw seaweed
    this.ctx.strokeStyle = '#2E8B57';
    this.ctx.lineWidth = 3;
    for (let i = 0; i < 20; i++) {
      const x = this.camera.x + i * 150;
      const sway = Math.sin(time + i) * 10;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.canvas.height - 40);
      this.ctx.quadraticCurveTo(x + sway, this.canvas.height - 100, x + sway * 2, this.canvas.height - 150);
      this.ctx.stroke();
    }
  }

  private drawPlayer() {
    // Simple player representation (Mola Mola fish)
    this.ctx.fillStyle = this.player.powerUps.speedBoost ? '#FFD700' : '#87CEEB';
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    
    // Add some fish-like details
    this.ctx.fillStyle = '#4682B4';
    this.ctx.fillRect(this.player.x + 10, this.player.y + 15, 15, 30);
    this.ctx.fillRect(this.player.x + 35, this.player.y + 25, 15, 10);
    
    // Eye
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.player.x + 40, this.player.y + 15, 8, 8);
  }

  private drawEnemy(enemy: Enemy) {
    // Simple enemy representation (Jellyfish)
    this.ctx.fillStyle = '#9B59B6';
    this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height * 0.6);
    
    // Tentacles
    this.ctx.fillStyle = '#8E44AD';
    for (let i = 0; i < 4; i++) {
      this.ctx.fillRect(
        enemy.x + i * 12 + 4,
        enemy.y + enemy.height * 0.6,
        4,
        enemy.height * 0.4
      );
    }
  }

  private drawCollectible(collectible: Collectible) {
    switch (collectible.type) {
      case 'coin':
        this.ctx.fillStyle = '#F1C40F';
        this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        this.ctx.fillStyle = '#F39C12';
        this.ctx.fillRect(collectible.x + 8, collectible.y + 8, 16, 16);
        break;
      case 'pizza':
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(collectible.x + 4, collectible.y + 4, 8, 8);
        this.ctx.fillRect(collectible.x + 20, collectible.y + 20, 8, 8);
        break;
      case 'brasilena':
        this.ctx.fillStyle = '#8E44AD';
        this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        this.ctx.fillStyle = '#9B59B6';
        this.ctx.fillRect(collectible.x + 8, collectible.y + 4, 16, 24);
        break;
      case 'wine':
        this.ctx.fillStyle = '#C0392B';
        this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        this.ctx.fillStyle = '#A93226';
        this.ctx.fillRect(collectible.x + 6, collectible.y + 8, 20, 16);
        break;
    }
  }

  private checkLevelCompletion() {
    const activeEnemies = this.enemies.length;
    const activeCoins = this.collectibles.filter(c => c.type === 'coin' && !c.collected).length;
    
    if (activeEnemies === 0 && activeCoins === 0) {
      if (this.player.level >= 10) {
        this.endGame(true);
      } else {
        this.player.level++;
        this.generateLevel(this.player.level);
        this.updateGameState();
      }
    }
  }

  private gameLoop = () => {
    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();
    this.checkLevelCompletion();
    
    this.draw();
    
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    this.gameLoop();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
