import { GameState } from './types'; // Предполагается, что у вас есть файл types.ts для GameState

// Константы для настройки игры
const JUMP_BOOST_MULTIPLIER = 3.5;
const JUMP_BOOST_DURATION_FRAMES = 7 * 60; // 7 секунд * 60 кадров/сек
const MAX_WINES_PER_LEVEL = 10;
const MAX_WINES_BOSS_LEVEL = 15;
const BOSS_LEVEL = 10; // Финальный уровень
const BOSS_INITIAL_HEALTH = 1000; // Примерное здоровье босса
const BOSS_COIN_DROP_PERCENTAGES = [0.2, 0.1, 0]; // 80%, 90%, 100% жизни истощено
const BOSS_COIN_DROP_AMOUNT_ON_HIT = 100; // Монет за каждый выстрел в босса
const BOSS_DEATH_COIN_COLLECTION_TIME_FRAMES = 10 * 60; // 10 секунд после смерти босса
const MAX_GLOBAL_COINS = 1000; // Максимальное количество монет за всю игру

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
    baseJumpPower: -15, // Базовая сила прыжка
    jumpPower: -15, // Текущая сила прыжка
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
      jumpBoost: false, // Новое: усиление прыжка
      jumpBoostTime: 0, // Новое: таймер усиления прыжка
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
    health?: number; // Для босса
    isBoss?: boolean; // Для идентификации босса
    coinDropThresholds?: number[]; // Для босса, чтобы отслеживать выпадение монет
  }> = [];

  private coins: Array<{ x: number; y: number; width: number; height: number; isFromBoss?: boolean }> = [];
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

  private winesCollectedThisLevel: number = 0; // Новое: счетчик вина за уровень
  private bossHealth: number = BOSS_INITIAL_HEALTH; // Новое: здоровье босса
  private bossCoinCollectionTimer: number = 0; // Новое: таймер для сбора монет после смерти босса
  private bossAlreadyDroppedCoinsAt: { [key: string]: boolean } = {}; // Новое: отслеживание дропа монет боссом

  // Загрузка изображений
  private images: {
    playerFrames: HTMLImageElement[];
    enemy: HTMLImageElement;
    boss?: HTMLImageElement; // Новое: спрайт босса
    pizza: HTMLImageElement;
    brasilena: HTMLImageElement;
    wine: HTMLImageElement;
    coin: HTMLImageElement;
    backgrounds: { img: HTMLImageElement; level: number }[];
  };

  // Callback'и для связи с React-компонентами UI
  private onUpdateUI: (state: GameState) => void;
  private onGameOver: (score: number) => void;
  private onGameWin: (score: number) => void;
  private onShowPowerUp: (type: 'speed' | 'jump' | 'ammo' | 'health') => void;
  private onRemovePowerUp: (type: 'speed' | 'jump' | 'ammo' | 'health') => void;
  private onBossHealthUpdate: (health: number, maxHealth: number) => void; // Новое: для обновления UI здоровья босса

  constructor(
    canvas: HTMLCanvasElement,
    onUpdateUI: (state: GameState) => void,
    onGameOver: (score: number) => void,
    onGameWin: (score: number) => void,
    onShowPowerUp: (type: 'speed' | 'jump' | 'ammo' | 'health') => void,
    onRemovePowerUp: (type: 'speed' | 'jump' | 'ammo' | 'health') => void,
    onBossHealthUpdate: (health: number, maxHealth: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false; // Отключаем сглаживание для пиксель-арта

    this.onUpdateUI = onUpdateUI;
    this.onGameOver = onGameOver;
    this.onGameWin = onGameWin;
    this.onShowPowerUp = onShowPowerUp;
    this.onRemovePowerUp = onRemovePowerUp;
    this.onBossHealthUpdate = onBossHealthUpdate;

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
    this.addEventListeners();
    this.resetGame(); // Вызываем resetGame здесь, чтобы инициализировать состояние
  }

  private loadImages() {
    // ВНИМАНИЕ: ЗАМЕНИТЕ ЭТИ URL-АДРЕСА НА ВАШИ РЕАЛЬНЫЕ!
    // Предполагается, что эти файлы находятся в корневом каталоге `public` в Lovable.dev
    this.images.playerFrames[0].src = '/Mola walking 1.webp';
    this.images.playerFrames[1].src = '/Mola walking 2.webp';
    this.images.enemy.src = '/medusa_pixel.jpg'; // Или .png с прозрачным фоном
    this.images.pizza.src = '/pizza_pixel.png';
    this.images.brasilena.src = '/brasilena_pixel.png';
    this.images.wine.src = '/wine_pixel.png';
    this.images.coin.src = '/coin_pixel.png'; // Убедитесь, что coin_pixel.png предоставлен

    // Если есть отдельный спрайт босса:
    this.images.boss = new Image();
    this.images.boss.src = '/medusa_boss_pixel.png'; // Или используйте существующий enemy спрайт

    for (let i = 1; i <= 10; i++) {
      const bg = new Image();
      bg.src = `/underwater_bg_${i}_pixel.png`; // Убедитесь, что эти файлы предоставлены
      this.images.backgrounds.push({ img: bg, level: i });
    }
  }

  private addEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && this.player.ammo > 0 && Date.now() - this.lastShotTime > this.SHOT_COOLDOWN) {
      this.shoot();
      this.lastShotTime = Date.now();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public start() {
    this.resetGame();
    if (this.animationId) cancelAnimationFrame(this.animationId); // Убедимся, что предыдущая анимация остановлена
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    // НЕ удаляем event listeners здесь, так как они нужны для последующих запусков
    // this.removeEventListeners();
  }

  // Решение №4: кнопка запустить игру заново не срабатывает.
  // Эта функция будет полностью сбрасывать все игровое состояние.
  public resetGame() {
    this.player = {
      x: 100,
      y: 300,
      width: 64,
      height: 64,
      velX: 0,
      velY: 0,
      speed: 5,
      baseJumpPower: -15,
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
        jumpBoost: false,
        jumpBoostTime: 0,
      },
    };

    this.bullets.length = 0;
    this.enemies.length = 0;
    this.coins.length = 0;
    this.pizzas.length = 0;
    this.brasilenas.length = 0;
    this.wines.length = 0;

    this.winesCollectedThisLevel = 0; // Сброс счетчика вина
    this.bossHealth = BOSS_INITIAL_HEALTH; // Сброс здоровья босса
    this.bossCoinCollectionTimer = 0; // Сброс таймера
    this.bossAlreadyDroppedCoinsAt = {}; // Сброс триггеров монет босса

    this.onRemovePowerUp('speed'); // Убираем любые активные эффекты UI
    this.onRemovePowerUp('jump'); // Убираем эффект прыжка
    this.generateLevel(this.player.level); // Генерируем объекты для первого уровня
    this.updateUI(); // Обновляем UI
    this.onBossHealthUpdate(this.bossHealth, BOSS_INITIAL_HEALTH); // Сброс UI здоровья босса
  }

  private generatePixelPlatforms(level: number) {
    const currentPlatforms = [];
    currentPlatforms.push({
      x: 0,
      y: this.canvas.height - 40,
      width: this.canvas.width,
      height: 40,
      color: '#8B4513',
    });

    const platformCount = 5 + level * 2;
    for (let i = 0; i < platformCount; i++) {
      currentPlatforms.push({
        x: Math.random() * (this.canvas.width - 100) + 50,
        y: 100 + Math.random() * (this.canvas.height - 200),
        width: 80 + Math.random() * 70,
        height: 16,
        color: i % 2 ? '#2E8B57' : '#1E90FF',
      });
    }
    return currentPlatforms;
  }

  private generateLevel(level: number) {
    this.enemies.length = 0;
    this.coins.length = 0;
    this.pizzas.length = 0;
    this.brasilenas.length = 0;
    this.wines.length = 0;
    this.winesCollectedThisLevel = 0; // Сбрасываем счетчик для нового уровня

    this.platforms = this.generatePixelPlatforms(level);

    if (level === BOSS_LEVEL) {
      // Финальный уровень с боссом
      this.bossHealth = BOSS_INITIAL_HEALTH; // Инициализация здоровья босса
      this.bossAlreadyDroppedCoinsAt = {}; // Сброс триггеров
      this.onBossHealthUpdate(this.bossHealth, BOSS_INITIAL_HEALTH);
      this.enemies.push({
        x: this.canvas.width - 150, // Босс справа
        y: this.canvas.height / 2 - 100, // Примерное положение
        width: 128, // Увеличим размер босса
        height: 128,
        speed: 0.5, // Босс движется медленнее
        health: this.bossHealth,
        isBoss: true,
        // Для отслеживания дропа монет по % здоровья
        coinDropThresholds: [...BOSS_COIN_DROP_PERCENTAGES].sort((a, b) => a - b),
      });

      // Решение №2: 15 бутылок вина на финальном уровне
      const maxWines = MAX_WINES_BOSS_LEVEL;
      for (let i = 0; i < maxWines; i++) {
        this.wines.push({
          x: Math.random() * (this.canvas.width - 100) + this.canvas.width,
          y: Math.random() * (this.canvas.height - 150) + 50,
          width: 32,
          height: 32,
        });
      }
    } else {
      // Обычные уровни
      const enemyCount = 5 + level * 2;
      const coinCount = 10 + level * 3;

      for (let i = 0; i < enemyCount; i++) {
        this.enemies.push({
          x: Math.random() * (this.canvas.width - 100) + this.canvas.width,
          y: Math.random() * (this.canvas.height - 150) + 50,
          width: 48,
          height: 48,
          speed: 1 + level * 0.2,
        });
      }

      for (let i = 0; i < coinCount; i++) {
        this.coins.push({
          x: Math.random() * (this.canvas.width - 100) + this.canvas.width,
          y: Math.random() * (this.canvas.height - 150) + 50,
          width: 32,
          height: 32,
        });
      }

      // Генерация предметов
      const itemSpawnArea = this.canvas.width * 1.5;
      for (let i = 0; i < 3; i++) {
        this.pizzas.push({
          x: Math.random() * itemSpawnArea + this.canvas.width,
          y: Math.random() * (this.canvas.height - 150) + 50,
          width: 32,
          height: 32,
        });
      }

      for (let i = 0; i < 2; i++) {
        this.brasilenas.push({
          x: Math.random() * itemSpawnArea + this.canvas.width,
          y: Math.random() * (this.canvas.height - 150) + 50,
          width: 32,
          height: 32,
        });
        // Решение №1: не больше 10 бутылок вина за уровень (для обычных уровней)
        if (this.winesCollectedThisLevel < MAX_WINES_PER_LEVEL) {
          this.wines.push({
            x: Math.random() * itemSpawnArea + this.canvas.width,
            y: Math.random() * (this.canvas.height - 150) + 50,
            width: 32,
            height: 32,
          });
        }
      }
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
    });

    this.player.ammo--;
    this.updateUI();
  }

  private updatePlayer() {
    this.player.velY += 0.5; // Гравитация

    this.player.velX = 0;
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.player.velX = -this.player.speed;
    } else if (this.keys['arrowright'] || this.keys['d']) {
      this.player.velX = this.player.speed;
    }

    // Анимация ходьбы
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

    // Прыжок
    if ((this.keys['arrowup'] || this.keys['w']) && this.player.grounded) {
      this.player.velY = this.player.jumpPower; // Используем текущую силу прыжка
      this.player.grounded = false;
    }

    this.player.x += this.player.velX;
    this.player.y += this.player.velY;

    // Ограничение по границам Canvas
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width)
      this.player.x = this.canvas.width - this.player.width;

    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y + this.player.height > this.canvas.height) {
      this.player.y = this.canvas.height - this.player.height;
      this.player.velY = 0;
      this.player.grounded = true;
    }

    this.player.grounded = false;
    this.platforms.forEach((platform) => {
      if (
        this.player.x < platform.x + platform.width &&
        this.player.x + this.player.width > platform.x &&
        this.player.y + this.player.height <= platform.y &&
        this.player.y + this.player.height + this.player.velY >= platform.y
      ) {
        this.player.y = platform.y - this.player.height;
        this.player.velY = 0;
        this.player.grounded = true;
      }
    });

    // Коллизия с врагами
    this.enemies.forEach((enemy) => {
      if (
        this.player.x < enemy.x + enemy.width &&
        this.player.x + this.player.width > enemy.x &&
        this.player.y < enemy.y + enemy.height &&
        this.player.y + this.player.height > enemy.y
      ) {
        if (!enemy.isBoss) { // Обычные враги наносят урон
          this.player.health -= 5;
          this.updateUI();
          // Отталкивание игрока от врага
          if (this.player.x < enemy.x) {
            this.player.x -= 20;
          } else {
            this.player.x += 20;
          }
        }
        
        if (this.player.health <= 0) {
          this.onGameOver(this.player.coins);
          this.stop();
        }
      }
    });

    // Сбор предметов
    this.checkCollectibles(this.coins, (itemIndex) => {
      if (this.player.coins < MAX_GLOBAL_COINS) { // Решение №3: Максимум 1000 монет
        this.player.coins++;
      }
      this.coins.splice(itemIndex, 1);
      this.updateUI();
    });
    this.checkCollectibles(this.pizzas, (itemIndex) => {
      this.player.health = Math.min(this.player.health + 20, 100);
      this.pizzas.splice(itemIndex, 1);
      this.updateUI();
    });
    this.checkCollectibles(this.brasilenas, (itemIndex) => {
      this.player.ammo += 10;
      this.brasilenas.splice(itemIndex, 1);
      this.updateUI();
    });
    this.checkCollectibles(this.wines, (itemIndex) => {
      // Решение №1: Усиление прыжка
      if (!this.player.powerUps.jumpBoost) { // Применяем только если усиление не активно
        this.player.powerUps.jumpBoost = true;
        this.player.powerUps.jumpBoostTime = JUMP_BOOST_DURATION_FRAMES;
        this.player.jumpPower = this.player.baseJumpPower * JUMP_BOOST_MULTIPLIER;
        this.onShowPowerUp('jump');
      }
      this.wines.splice(itemIndex, 1);
      this.winesCollectedThisLevel++; // Увеличиваем счетчик
    });

    // Обновление эффектов усилений
    if (this.player.powerUps.speedBoost) {
      this.player.powerUps.speedBoostTime--;
      if (this.player.powerUps.speedBoostTime <= 0) {
        this.player.powerUps.speedBoost = false;
        this.player.speed = 5;
        this.onRemovePowerUp('speed');
      }
    }
    // Новое: Обновление эффекта усиления прыжка
    if (this.player.powerUps.jumpBoost) {
      this.player.powerUps.jumpBoostTime--;
      if (this.player.powerUps.jumpBoostTime <= 0) {
        this.player.powerUps.jumpBoost = false;
        this.player.jumpPower = this.player.baseJumpPower; // Возвращаем базовую силу прыжка
        this.onRemovePowerUp('jump');
      }
    }
  }

  private checkCollectibles(array: any[], action: (index: number) => void) {
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (
        this.player.x < item.x + item.width &&
        this.player.x + this.player.width > item.x &&
        this.player.y < item.y + item.height &&
        this.player.y + this.player.height > item.y
      ) {
        action(i);
        i--;
      }
    }
  }

  private updateEnemies() {
    this.enemies.forEach((enemy) => {
      // Босс не движется, только обычные враги
      if (!enemy.isBoss) {
        enemy.x -= enemy.speed;
        if (enemy.x + enemy.width < 0) {
          enemy.x = this.canvas.width + Math.random() * this.canvas.width;
          enemy.y = Math.random() * (this.canvas.height - 200) + 100;
        }
      }
    });
  }

  private updateBullets() {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].x += this.bullets[i].speed;
      if (this.bullets[i].x > this.canvas.width) {
        this.bullets.splice(i, 1);
        i--;
        continue;
      }

      for (let j = 0; j < this.enemies.length; j++) {
        const enemy = this.enemies[j];
        if (
          this.bullets[i].x < enemy.x + enemy.width &&
          this.bullets[i].x + this.bullets[i].width > enemy.x &&
          this.bullets[i].y < enemy.y + enemy.height &&
          this.bullets[i].y + this.bullets[i].height > enemy.y
        ) {
          // Пуля попала во врага
          this.bullets.splice(i, 1);
          i--; // Корректируем индекс пули
          
          if (enemy.isBoss && enemy.health !== undefined) {
            // Решение №3: Логика босса
            enemy.health -= 50; // Урон боссу от пули
            this.bossHealth = enemy.health; // Обновляем основное состояние здоровья босса
            this.onBossHealthUpdate(this.bossHealth, BOSS_INITIAL_HEALTH);

            // Решение №3: Вылет монет за попадание
            if (this.player.coins < MAX_GLOBAL_COINS) {
              this.player.coins = Math.min(MAX_GLOBAL_COINS, this.player.coins + BOSS_COIN_DROP_AMOUNT_ON_HIT);
              this.updateUI();
            }

            // Проверка порогов для массового вылета монет
            const currentHealthPercentage = this.bossHealth / BOSS_INITIAL_HEALTH;
            enemy.coinDropThresholds?.forEach(threshold => {
              if (currentHealthPercentage <= threshold && !this.bossAlreadyDroppedCoinsAt[threshold]) {
                for (let k = 0; k < BOSS_COIN_DROP_AMOUNT_ON_HIT; k++) { // Вылетает 100 монет
                  if (this.player.coins < MAX_GLOBAL_COINS) {
                    this.coins.push({
                      x: enemy.x + enemy.width / 2 + Math.random() * 50 - 25,
                      y: enemy.y + enemy.height / 2 + Math.random() * 50 - 25,
                      width: 32,
                      height: 32,
                      isFromBoss: true, // Помечаем монеты от босса
                    });
                  }
                }
                this.bossAlreadyDroppedCoinsAt[threshold] = true; // Отмечаем, что монеты уже выпали на этом пороге
              }
            });

            if (enemy.health <= 0) {
              // Босс побежден
              this.enemies.splice(j, 1); // Удаляем босса
              this.bossCoinCollectionTimer = BOSS_DEATH_COIN_COLLECTION_TIME_FRAMES; // Запускаем таймер сбора монет
              this.onBossHealthUpdate(0, BOSS_INITIAL_HEALTH); // Обновляем UI здоровья босса до 0

              // Решение №3: Дополнительные монеты при смерти босса (если еще не было 100%)
              if (!this.bossAlreadyDroppedCoinsAt[0]) {
                for (let k = 0; k < BOSS_COIN_DROP_AMOUNT_ON_HIT; k++) {
                  if (this.player.coins < MAX_GLOBAL_COINS) {
                    this.coins.push({
                      x: enemy.x + enemy.width / 2 + Math.random() * 50 - 25,
                      y: enemy.y + enemy.height / 2 + Math.random() * 50 - 25,
                      width: 32,
                      height: 32,
                      isFromBoss: true,
                    });
                  }
                }
                this.bossAlreadyDroppedCoinsAt[0] = true;
              }
            }
          } else {
            // Обычный враг
            this.enemies.splice(j, 1);
            this.player.coins += 2;
            this.updateUI();
          }
          break; // Пуля может поразить только одного врага
        }
      }
    }
  }

  private updateUI() {
    this.onUpdateUI({
      health: this.player.health,
      ammo: this.player.ammo,
      coins: this.player.coins,
      level: this.player.level,
      powerUps: this.player.powerUps,
    });
  }

  private drawPixelBackground() {
    const bg = this.images.backgrounds[this.player.level - 1];
    if (bg && bg.img.complete) {
      this.ctx.drawImage(bg.img, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#1a2980';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Пиксельные пузыри (анимация)
    for (let i = 0; i < 20; i++) {
      const scrollFactor = 0.1;
      const baseX = (i * 40 - this.player.x * scrollFactor) % this.canvas.width;
      const x = baseX < 0 ? baseX + this.canvas.width : baseX;

      const y = (Date.now() / 50 + i * 20) % (this.canvas.height + 50) - 50;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillRect(Math.floor(x), Math.floor(y), 3, 3);
      this.ctx.fillRect(Math.floor(x + 2), Math.floor(y - 3), 2, 2);
    }

    this.platforms.forEach((platform) => {
      this.ctx.fillStyle = platform.color;
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
  }

  private drawGameObjects() {
    const currentPlayerFrame = this.images.playerFrames[this.player.frame];
    if (currentPlayerFrame.complete) {
      this.ctx.drawImage(
        currentPlayerFrame,
        Math.floor(this.player.x),
        Math.floor(this.player.y),
        this.player.width,
        this.player.height
      );
    }
    
    this.enemies.forEach((enemy) => {
      const enemyImage = enemy.isBoss && this.images.boss ? this.images.boss : this.images.enemy;
      if (enemyImage.complete) {
        this.ctx.drawImage(enemyImage, Math.floor(enemy.x), Math.floor(enemy.y), enemy.width, enemy.height);
      }
    });
    
    this.bullets.forEach((bullet) => {
      this.ctx.fillStyle = '#3498db';
      this.ctx.fillRect(Math.floor(bullet.x), Math.floor(bullet.y), bullet.width, bullet.height);
    });
    
    this.coins.forEach((coin) => {
        // Если монета от босса, и таймер активен, она движется к игроку
        if (coin.isFromBoss && this.bossCoinCollectionTimer > 0) {
            const dx = this.player.x - coin.x;
            const dy = this.player.y - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) { // Чтобы не было бесконечного притяжения на месте
                coin.x += (dx / dist) * 5; // Скорость притяжения
                coin.y += (dy / dist) * 5;
            }
        }
        if (this.images.coin.complete) {
            this.ctx.drawImage(this.images.coin, Math.floor(coin.x), Math.floor(coin.y), coin.width, coin.height);
        }
    });
    
    this.pizzas.forEach((pizza) => {
      if (this.images.pizza.complete) {
        this.ctx.drawImage(this.images.pizza, Math.floor(pizza.x), Math.floor(pizza.y), pizza.width, pizza.height);
      }
    });
    
    this.brasilenas.forEach((brasilena) => {
      if (this.images.brasilena.complete) {
        this.ctx.drawImage(this.images.brasilena, Math.floor(brasilena.x), Math.floor(brasilena.y), brasilena.width, brasilena.height);
      }
    });
    
    this.wines.forEach((wine) => {
      if (this.images.wine.complete) {
        this.ctx.drawImage(this.images.wine, Math.floor(wine.x), Math.floor(wine.y), wine.width, wine.height);
      }
    });
  }

  private gameLoop = () => {
    // Если игра завершена (Game Over / Win), просто останавливаем цикл
    if (this.animationId === null) return;

    // Обновление состояния игры
    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();

    // Новое: Управление таймером сбора монет после смерти босса
    if (this.bossCoinCollectionTimer > 0) {
      this.bossCoinCollectionTimer--;
      if (this.bossCoinCollectionTimer <= 0) {
        // Время для сбора монет истекло, переходим к следующему уровню/победе
        this.onGameWin(this.player.coins); // Победа, если босс побежден
        this.stop();
        return;
      }
    }

    // Проверка завершения уровня (если все враги и предметы собраны ИЛИ босс побежден)
    const isLevelClear = (this.enemies.length === 0 && this.coins.filter(c => !c.isFromBoss).length === 0 && this.brasilenas.length === 0 && this.pizzas.length === 0 && this.wines.length === 0);
    
    if (this.player.level === BOSS_LEVEL) {
      // На уровне босса, если босс побежден и таймер сбора монет истек
      if (this.enemies.length === 0 && this.bossCoinCollectionTimer === 0) {
        this.player.level++; // Переход к следующему уровню (завершение игры)
        if (this.player.level > 10) { // Проверка на максимальный уровень
          this.onGameWin(this.player.coins);
          this.stop();
          return;
        }
        this.generateLevel(this.player.level);
        this.updateUI();
      }
    } else {
      // Для обычных уровней
      if (isLevelClear) {
        this.player.level++;
        if (this.player.level > 10) {
          this.onGameWin(this.player.coins);
          this.stop();
          return;
        }
        this.generateLevel(this.player.level);
        this.updateUI();
      }
    }
    
    // Очистка и отрисовка
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPixelBackground();
    this.drawGameObjects();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  // Методы для обработки мобильных нажатий
  public handleMobileMove(direction: 'left' | 'right' | 'none') {
    if (direction === 'left') {
      this.keys['arrowleft'] = true;
      this.keys['arrowright'] = false;
    } else if (direction === 'right') {
      this.keys['arrowright'] = true;
      this.keys['arrowleft'] = false;
    } else {
      this.keys['arrowleft'] = false;
      this.keys['arrowright'] = false;
    }
  }

  public handleMobileJump(isJumping: boolean) {
    if (isJumping && this.player.grounded) {
      this.keys['arrowup'] = true;
      this.player.velY = this.player.jumpPower;
    } else if (!isJumping) {
      this.keys['arrowup'] = false;
    }
  }

  public handleMobileShoot() {
    if (this.player.ammo > 0 && Date.now() - this.lastShotTime > this.SHOT_COOLDOWN) {
      this.shoot();
      this.lastShotTime = Date.now();
    }
  }
}
