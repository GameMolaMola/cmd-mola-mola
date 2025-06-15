// Менеджер звуков для ретро-игры с интеграцией генератора фоновой музыки уровней (чиптюн)
class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private isMuted: boolean = false;
  private ambientLoopId: number | null = null;

  // --- music ---
  private musicCurrentLevel: number | null = null;
  private musicTimeouts: number[] = [];
  private musicLoopDuration: number = 8; // seconds for the loop
  private musicStartedAt: number | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Начальная громкость
      console.log('[AudioManager] AudioContext initialized successfully');
    } catch (error) {
      console.warn('Web Audio API не поддерживается:', error);
      this.isEnabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.isEnabled) {
      console.log('[AudioManager] AudioContext not available or disabled');
      return false;
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('[AudioManager] AudioContext resumed successfully');
      } catch (error) {
        console.warn('Не удалось возобновить AudioContext:', error);
        return false;
      }
    }

    return true;
  }

  // Активация звука по клику пользователя (улучшено для мобильных)
  async activateAudio() {
    console.log('[AudioManager] Attempting to activate audio...');
    
    if (!this.audioContext) {
      console.warn('[AudioManager] No audio context available');
      return;
    }
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('[AudioManager] Audio activated by user interaction, state:', this.audioContext.state);
        
        // Дополнительная проверка после активации
        if (this.audioContext.state === 'running') {
          console.log('[AudioManager] AudioContext is now running successfully');
        } else {
          console.warn('[AudioManager] AudioContext state after resume:', this.audioContext.state);
        }
      } catch (error) {
        console.error('[AudioManager] Failed to resume audio context:', error);
      }
    } else {
      console.log('[AudioManager] AudioContext already active, state:', this.audioContext.state);
    }
  }

  // --- MUSIC SYSTEM START (improved mobile support) ---
  // Основная функция для генерации зацикленной музыки для конкретного уровня
  public async playLevelMusic(level: number) {
    console.log(`[AudioManager] Attempting to play level ${level} music, muted: ${this.isMuted}, context state: ${this.audioContext?.state}`);
    
    if (!await this.ensureAudioContext() || this.isMuted) {
      console.log('[AudioManager] AudioContext not available, muted, or not running');
      return;
    }
    
    this.stopLevelMusic(); // отменить текущее
    this.musicCurrentLevel = level;

    const ctx = this.audioContext!;
    const tempo = 135 + level * 7; // faster per level
    const loopLen = 8 + level * 0.6; // секунд(loop), чуть длиннее на высоких
    this.musicLoopDuration = loopLen;

    const startAt = ctx.currentTime + 0.08; // чуть позже
    this.musicStartedAt = ctx.currentTime;

    console.log(`[AudioManager] Starting level ${level} music with tempo ${tempo}, context time: ${ctx.currentTime}`);

    // Вспомогатель: нота
    const note = (freq: number, t: number, dur: number, type: OscillatorType, vol: number=0.14) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g).connect(this.masterGain!);
      o.start(startAt + t);
      o.stop(startAt + t + dur);
      // Очищаем
      const tid = window.setTimeout(() => { o.disconnect(); g.disconnect(); }, (t+dur)*1000 + 500);
      this.musicTimeouts.push(tid);
    };

    // База: базовая гамма сдвигов (C мажор и вариации)
    const scales = [
      [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],   // C, D, E, G, A, C'
      [220, 261.63, 293.66, 349.23, 392.00, 493.88],       // A min* → D G B
      [329.63, 392.00, 440.00, 523.25, 587.33, 659.25],     // E, G, A... для яркости
    ];

    const scale = scales[level % 3];
    const melodyLen = 32 + Math.floor(level * 2.0);

    // --- DRUMS ---
    // Kick, snare, hihat расписание (channel separation)
    const drum = (type: 'kick'|'snare'|'hihat', t: number, vol: number=0.16) => {
      if (type === 'kick') {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(120, startAt + t);
        o.frequency.exponentialRampToValueAtTime(44, startAt + t + 0.11);
        g.gain.value = vol*1.8;
        o.connect(g).connect(this.masterGain!);
        o.start(startAt + t);
        o.stop(startAt + t + 0.14);
        const id = window.setTimeout(() => { o.disconnect(); g.disconnect(); }, (t+0.2)*1000 + 500);
        this.musicTimeouts.push(id);
      } else if (type === 'snare') {
        const bufferSize = ctx.sampleRate * 0.06;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const g = ctx.createGain();
        g.gain.value = vol;
        g.gain.linearRampToValueAtTime(0.01, startAt + t + 0.04);
        noise.connect(g).connect(this.masterGain!);
        noise.start(startAt + t);
        noise.stop(startAt + t + 0.045);
        const id = window.setTimeout(() => { noise.disconnect(); g.disconnect(); }, (t+0.09)*1000 + 500);
        this.musicTimeouts.push(id);
      } else if (type === 'hihat') {
        const bufferSize = ctx.sampleRate * 0.012;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const g = ctx.createGain();
        g.gain.value = vol/2;
        g.gain.linearRampToValueAtTime(0.001, startAt + t + 0.04);
        noise.connect(g).connect(this.masterGain!);
        noise.start(startAt + t);
        noise.stop(startAt + t + 0.04);
        const id = window.setTimeout(() => { noise.disconnect(); g.disconnect(); }, (t+0.1)*1000 + 500);
        this.musicTimeouts.push(id);
      }
    };
    // Drum pattern: зависит от уровня (больше снейров/кейков с ростом)
    for(let b = 0; b < loopLen*tempo/60; b++) {
      const t = b * (60/tempo);
      drum('kick', t);
      if ((b+level)%4 === 2) drum('snare', t+0.15);
      if (b%2===1) drum('hihat', t+0.02);
    }

    // --- MELODY arpeggio ---
    // Усложняем с ростом уровня
    for(let i=0; i<melodyLen; i++) {
      const noteT = i*(60/tempo)/2;
      let pitch = scale[(i + (level%3) + Math.floor(i/4)) % scale.length] * (1 + 0.01*(level-1));
      // Арпеджио: 8-бит, варьируем waveform с ростом уровня
      const type: OscillatorType = level>7 ? "triangle" : (level>3 ? "sawtooth" : "square");
      note(pitch, noteT, 0.13+(0.01*level), type, 0.11+level*0.012);
      // иногда добавим "верхний голос"
      if ((i%4)===0 && level>2) note(pitch*2, noteT+0.05, 0.08, "square",0.06+0.015*level);
    }

    // --- BASS ---
    for(let i=0; i<Math.ceil(loopLen*tempo/60/2); i++) {
      const t = i*2*(60/tempo);
      let bass = scale[0]*0.5;
      note(bass, t+0.03, 0.23, "square", 0.13+level*0.015);
      if (level>4 && i%3==0) note(bass*2, t+0.18, 0.1, "square", 0.07+0.01*level);
    }

    // --- HARMONY / PAD ---
    if(level>=6) {
      for(let i=0; i<scale.length; i++) {
        let t = (i*1.9)%loopLen;
        note(scale[i], t+0.08,0.27,"triangle", 0.07+0.006*level);
      }
    }

    // Повтор после всей длины
    const loopTimer = window.setTimeout(() => {
      if(this.musicCurrentLevel===level && !this.isMuted) {
        console.log(`[AudioManager] Restarting level ${level} music loop`);
        this.playLevelMusic(level);
      }
    }, loopLen*1000);
    this.musicTimeouts.push(loopTimer);
  }

  // Остановить текущую музыку уровня и очистить таймеры/звуки
  public stopLevelMusic() {
    if(this.musicTimeouts&&this.musicTimeouts.length) {
      this.musicTimeouts.forEach(id=>clearTimeout(id));
      this.musicTimeouts=[];
    }
    this.musicCurrentLevel=null;
  }
  // --- MUSIC SYSTEM END ---

  // --- обычные FX ---
  // Генерация звука монеты (высокий тон)
  async playCoinSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext!.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext!.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.2);
    
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.2);
  }

  // Звук прыжка (sweep вниз)
  async playJumpSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    oscillator.frequency.setValueAtTime(300, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext!.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3);
    
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.3);
  }

  // Звук выстрела (короткий шум)
  async playShootSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext!.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.1);
    
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.1);
  }

  // Звук урона (низкий резкий тон)
  async playDamageSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, this.audioContext!.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.4);
    
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.4);
  }

  // Звук сбора предмета (мелодичный)
  async playItemSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < frequencies.length; i++) {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext!.currentTime);
      
      const startTime = this.audioContext!.currentTime + i * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    }
  }

  // Звук победы на уровне (восходящая арпеджио)
  async playLevelWinSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    for (let i = 0; i < frequencies.length; i++) {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext!.currentTime);
      
      const startTime = this.audioContext!.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }
  }

  // Звук поражения (нисходящий тон)
  async playGameOverSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext!.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 1.5);
    
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 1.5);
  }

  // Заглушка: playAmbientLoop больше не нужна, используем только playLevelMusic
  async playAmbientLoop() { /* no-op for now */ }
  stopAmbientLoop() { /* no-op for now */ }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  mute() {
    this.isMuted = true;
    this.stopLevelMusic();
  }
  unmute() {
    this.isMuted = false;
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopLevelMusic();
    } else if (this.musicCurrentLevel != null) {
      this.playLevelMusic(this.musicCurrentLevel);
    }
  }
  isMutedState() { return this.isMuted; }
}

// Создаём глобальный экземпляр
export const audioManager = new AudioManager();

// Внешний API:
export const playLevelMusic = (level: number) => audioManager.playLevelMusic(level);
export const stopLevelMusic = () => audioManager.stopLevelMusic();
export const activateAudio = () => audioManager.activateAudio();
