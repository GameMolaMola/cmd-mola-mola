// Менеджер звуков для ретро-игры с использованием Web Audio API
class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private isMuted: boolean = false;
  private ambientLoopId: number | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Начальная громкость
    } catch (error) {
      console.warn('Web Audio API не поддерживается:', error);
      this.isEnabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.isEnabled) return false;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Не удалось возобновить AudioContext:', error);
        return false;
      }
    }
    return true;
  }

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

  // Новая супер веселая и динамичная фоновая музыка
  async playAmbientLoop() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    // Очень веселая и энергичная мелодия в мажорной тональности
    const melodyNotes = [
      { freq: 523.25, time: 0 },    // C5 - высокий тон
      { freq: 659.25, time: 0.2 },  // E5
      { freq: 783.99, time: 0.4 },  // G5
      { freq: 1046.5, time: 0.6 },  // C6 - очень высокий
      { freq: 880.00, time: 0.8 },  // A5
      { freq: 783.99, time: 1.0 },  // G5
      { freq: 659.25, time: 1.2 },  // E5
      { freq: 523.25, time: 1.4 },  // C5
      { freq: 698.46, time: 1.6 },  // F5
      { freq: 783.99, time: 1.8 },  // G5
      { freq: 880.00, time: 2.0 },  // A5
      { freq: 1046.5, time: 2.2 },  // C6
    ];

    // Энергичная басовая линия
    const bassNotes = [
      { freq: 130.81, time: 0 },    // C3
      { freq: 164.81, time: 0.4 },  // E3
      { freq: 196.00, time: 0.8 },  // G3
      { freq: 130.81, time: 1.2 },  // C3
      { freq: 174.61, time: 1.6 },  // F3
      { freq: 196.00, time: 2.0 },  // G3
    ];

    // Дополнительная гармония для богатства звучания
    const harmonyNotes = [
      { freq: 329.63, time: 0.1 },  // E4
      { freq: 392.00, time: 0.3 },  // G4
      { freq: 493.88, time: 0.5 },  // B4
      { freq: 587.33, time: 0.7 },  // D5
      { freq: 523.25, time: 0.9 },  // C5
      { freq: 466.16, time: 1.1 },  // Bb4
      { freq: 440.00, time: 1.3 },  // A4
      { freq: 392.00, time: 1.5 },  // G4
    ];

    // Проигрываем мелодию с более ярким звуком
    melodyNotes.forEach(note => {
      setTimeout(async () => {
        if (!await this.ensureAudioContext() || this.isMuted) return;
        
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext!.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, this.audioContext!.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.25);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.25);
      }, note.time * 1000);
    });

    // Проигрываем гармонию
    harmonyNotes.forEach(note => {
      setTimeout(async () => {
        if (!await this.ensureAudioContext() || this.isMuted) return;
        
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext!.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext!.currentTime + 0.03);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.2);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.2);
      }, note.time * 1000);
    });

    // Энергичная басовая линия
    bassNotes.forEach(note => {
      setTimeout(async () => {
        if (!await this.ensureAudioContext() || this.isMuted) return;
        
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext!.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext!.currentTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.35);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.35);
      }, note.time * 1000);
    });

    // Добавляем активную перкуссию
    const beats = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2, 1.35, 1.5, 1.65, 1.8, 1.95, 2.1];
    beats.forEach(beatTime => {
      setTimeout(async () => {
        if (!await this.ensureAudioContext() || this.isMuted) return;
        
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(100, this.audioContext!.currentTime);
        
        gainNode.gain.setValueAtTime(0.06, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.08);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.08);
      }, beatTime * 1000);
    });

    // Запускаем повтор через 2.5 секунды для непрерывного проигрывания
    this.ambientLoopId = window.setTimeout(() => {
      if (!this.isMuted) {
        this.playAmbientLoop();
      }
    }, 2500);
  }

  stopAmbientLoop() {
    if (this.ambientLoopId) {
      clearTimeout(this.ambientLoopId);
      this.ambientLoopId = null;
    }
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  mute() {
    this.isMuted = true;
    this.stopAmbientLoop();
  }

  unmute() {
    this.isMuted = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientLoop();
    }
  }

  isMutedState() {
    return this.isMuted;
  }
}

// Создаём глобальный экземпляр
export const audioManager = new AudioManager();
