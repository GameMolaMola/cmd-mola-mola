
// Менеджер звуков для ретро-игры с поддержкой OGG файлов для фоновой музыки
class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private isMuted: boolean = false;

  // --- HTML5 Audio для музыки ---
  private musicAudios: Map<number, HTMLAudioElement> = new Map();
  private currentMusicAudio: HTMLAudioElement | null = null;
  private musicCurrentLevel: number | null = null;
  private musicPreloadPromises: Map<number, Promise<void>> = new Map();
  private musicLoadAttempted: Set<number> = new Set();

  // --- Fallback: генеративная музыка ---
  private musicTimeouts: number[] = [];
  private musicLoopDuration: number = 8;
  private musicStartedAt: number | null = null;
  private usingGenerativeMusic: boolean = false;

  constructor() {
    this.initAudioContext();
    this.preloadMusicFiles();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
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

  // Активация звука по клику пользователя
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
      } catch (error) {
        console.error('[AudioManager] Failed to resume audio context:', error);
      }
    }

    // Активируем HTML5 Audio для музыки на мобильных
    if (this.currentMusicAudio && this.currentMusicAudio.paused) {
      try {
        await this.currentMusicAudio.play();
        console.log('[AudioManager] Music audio activated on mobile');
      } catch (error) {
        console.log('[AudioManager] Music audio activation failed:', error);
      }
    }
  }

  // --- МУЗЫКАЛЬНАЯ СИСТЕМА ---
  private preloadMusicFiles() {
    // Предзагружаем файлы музыки для всех уровней (1-10)
    for (let level = 1; level <= 10; level++) {
      this.preloadMusicFile(level);
    }
  }

  private preloadMusicFile(level: number): Promise<void> {
    if (this.musicPreloadPromises.has(level)) {
      return this.musicPreloadPromises.get(level)!;
    }

    const promise = new Promise<void>((resolve) => {
      const audio = new Audio();
      const musicPath = `/audio/music/${level}.ogg`;
      
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.3;

      const onLoad = () => {
        console.log(`[AudioManager] Music file loaded: ${musicPath}`);
        this.musicAudios.set(level, audio);
        cleanup();
        resolve();
      };

      const onError = () => {
        console.warn(`[AudioManager] Failed to load music file: ${musicPath}, will use generative music`);
        cleanup();
        resolve();
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplaythrough', onLoad);
      audio.addEventListener('error', onError);
      audio.src = musicPath;
    });

    this.musicPreloadPromises.set(level, promise);
    return promise;
  }

  public async playLevelMusic(level: number) {
    console.log(`[AudioManager] Attempting to play level ${level} music, muted: ${this.isMuted}`);
    
    if (this.isMuted) {
      console.log('[AudioManager] Music is muted, skipping playback');
      return;
    }

    this.stopLevelMusic();
    this.musicCurrentLevel = level;

    // Пытаемся воспроизвести OGG файл
    await this.preloadMusicFile(level);
    const audio = this.musicAudios.get(level);

    if (audio) {
      try {
        console.log(`[AudioManager] Playing OGG music for level ${level}`);
        this.currentMusicAudio = audio;
        this.usingGenerativeMusic = false;
        
        // Сбрасываем на начало и запускаем
        audio.currentTime = 0;
        await audio.play();
        
        console.log(`[AudioManager] Successfully started OGG music for level ${level}`);
        return;
      } catch (error) {
        console.warn(`[AudioManager] Failed to play OGG music for level ${level}:`, error);
      }
    }

    // Fallback: используем генеративную музыку
    console.log(`[AudioManager] Using generative music for level ${level}`);
    this.usingGenerativeMusic = true;
    await this.playGenerativeMusic(level);
  }

  private async playGenerativeMusic(level: number) {
    if (!await this.ensureAudioContext()) {
      console.log('[AudioManager] AudioContext not available for generative music');
      return;
    }

    const ctx = this.audioContext!;
    const tempo = 135 + level * 7;
    const loopLen = 8 + level * 0.6;
    this.musicLoopDuration = loopLen;

    const startAt = ctx.currentTime + 0.08;
    this.musicStartedAt = ctx.currentTime;

    console.log(`[AudioManager] Starting generative music for level ${level} with tempo ${tempo}`);

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
      const tid = window.setTimeout(() => { o.disconnect(); g.disconnect(); }, (t+dur)*1000 + 500);
      this.musicTimeouts.push(tid);
    };

    // База: базовая гамма сдвигов (C мажор и вариации)
    const scales = [
      [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
      [220, 261.63, 293.66, 349.23, 392.00, 493.88],
      [329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    ];

    const scale = scales[level % 3];
    const melodyLen = 32 + Math.floor(level * 2.0);

    // Drums
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

    // Drum pattern
    for(let b = 0; b < loopLen*tempo/60; b++) {
      const t = b * (60/tempo);
      drum('kick', t);
      if ((b+level)%4 === 2) drum('snare', t+0.15);
      if (b%2===1) drum('hihat', t+0.02);
    }

    // Melody arpeggio
    for(let i=0; i<melodyLen; i++) {
      const noteT = i*(60/tempo)/2;
      let pitch = scale[(i + (level%3) + Math.floor(i/4)) % scale.length] * (1 + 0.01*(level-1));
      const type: OscillatorType = level>7 ? "triangle" : (level>3 ? "sawtooth" : "square");
      note(pitch, noteT, 0.13+(0.01*level), type, 0.11+level*0.012);
      if ((i%4)===0 && level>2) note(pitch*2, noteT+0.05, 0.08, "square",0.06+0.015*level);
    }

    // Bass
    for(let i=0; i<Math.ceil(loopLen*tempo/60/2); i++) {
      const t = i*2*(60/tempo);
      let bass = scale[0]*0.5;
      note(bass, t+0.03, 0.23, "square", 0.13+level*0.015);
      if (level>4 && i%3==0) note(bass*2, t+0.18, 0.1, "square", 0.07+0.01*level);
    }

    // Harmony/Pad
    if(level>=6) {
      for(let i=0; i<scale.length; i++) {
        let t = (i*1.9)%loopLen;
        note(scale[i], t+0.08,0.27,"triangle", 0.07+0.006*level);
      }
    }

    // Повтор после всей длины
    const loopTimer = window.setTimeout(() => {
      if(this.musicCurrentLevel===level && !this.isMuted && this.usingGenerativeMusic) {
        console.log(`[AudioManager] Restarting generative music loop for level ${level}`);
        this.playGenerativeMusic(level);
      }
    }, loopLen*1000);
    this.musicTimeouts.push(loopTimer);
  }

  public stopLevelMusic() {
    // Останавливаем HTML5 Audio
    if (this.currentMusicAudio) {
      this.currentMusicAudio.pause();
      this.currentMusicAudio = null;
      console.log('[AudioManager] Stopped HTML5 music audio');
    }

    // Останавливаем генеративную музыку
    if(this.musicTimeouts && this.musicTimeouts.length) {
      this.musicTimeouts.forEach(id => clearTimeout(id));
      this.musicTimeouts = [];
      console.log('[AudioManager] Stopped generative music');
    }

    this.musicCurrentLevel = null;
    this.usingGenerativeMusic = false;
  }

  // --- обычные FX ---
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

  async playHealthSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const frequencies = [440, 523.25, 659.25];
    
    for (let i = 0; i < frequencies.length; i++) {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext!.currentTime);
      
      const startTime = this.audioContext!.currentTime + i * 0.08;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.12);
    }
  }

  async playAmmoSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(600, this.audioContext!.currentTime);
      
      const startTime = this.audioContext!.currentTime + i * 0.05;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.04);
    }
  }

  async playPowerupSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const frequencies = [261.63, 329.63, 392.00, 523.25];
    
    frequencies.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext!.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3);
      
      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + 0.3);
    });
  }

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

  async playItemSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const frequencies = [523.25, 659.25, 783.99];
    
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

  async playLevelWinSound() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    const frequencies = [261.63, 329.63, 392.00, 523.25];
    
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

  // Заглушки для совместимости
  async playAmbientLoop() { /* no-op */ }
  stopAmbientLoop() { /* no-op */ }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
    
    // Обновляем громкость музыки
    if (this.currentMusicAudio) {
      this.currentMusicAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  mute() {
    this.isMuted = true;
    this.stopLevelMusic();
    console.log('[AudioManager] Audio muted');
  }

  unmute() {
    this.isMuted = false;
    console.log('[AudioManager] Audio unmuted');
    
    // Возобновляем музыку текущего уровня
    if (this.musicCurrentLevel != null) {
      this.playLevelMusic(this.musicCurrentLevel);
    }
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  isMutedState() { 
    return this.isMuted; 
  }

  // Дополнительный метод для получения информации о текущем состоянии
  getMusicInfo() {
    return {
      currentLevel: this.musicCurrentLevel,
      usingGenerativeMusic: this.usingGenerativeMusic,
      hasCurrentAudio: !!this.currentMusicAudio,
      isMuted: this.isMuted,
      loadedFiles: Array.from(this.musicAudios.keys())
    };
  }
}

// Создаём глобальный экземпляр
export const audioManager = new AudioManager();

// Внешний API
export const playLevelMusic = (level: number) => audioManager.playLevelMusic(level);
export const stopLevelMusic = () => audioManager.stopLevelMusic();
export const activateAudio = () => audioManager.activateAudio();
