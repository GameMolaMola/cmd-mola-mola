// Менеджер звуков для ретро-игры с использованием Web Audio API
class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;
  private isMuted: boolean = false;

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

  // Фоновая радостная и динамичная музыка
  async playAmbientLoop() {
    if (!await this.ensureAudioContext() || this.isMuted) return;
    
    // Более радостная и динамичная мелодия в мажорной тональности
    const melodyNotes = [
      { freq: 261.63, time: 0 },    // C4
      { freq: 329.63, time: 0.4 },  // E4
      { freq: 392.00, time: 0.8 },  // G4
      { freq: 523.25, time: 1.2 },  // C5
      { freq: 440.00, time: 1.6 },  // A4
      { freq: 392.00, time: 2.0 },  // G4
      { freq: 329.63, time: 2.4 },  // E4
      { freq: 261.63, time: 2.8 },  // C4
    ];

    // Басовая линия для ритма
    const bassNotes = [
      { freq: 130.81, time: 0 },    // C3
      { freq: 146.83, time: 0.8 },  // D3
      { freq: 164.81, time: 1.6 },  // E3
      { freq: 130.81, time: 2.4 },  // C3
    ];

    // Проигрываем мелодию
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
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext!.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.35);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.35);
      }, note.time * 1000);
    });

    // Проигрываем басовую линию
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
        gainNode.gain.linearRampToValueAtTime(0.06, this.audioContext!.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.7);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.7);
      }, note.time * 1000);
    });

    // Добавляем перкуссию для ритма
    const beats = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8];
    beats.forEach(beatTime => {
      setTimeout(async () => {
        if (!await this.ensureAudioContext() || this.isMuted) return;
        
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(80, this.audioContext!.currentTime);
        
        gainNode.gain.setValueAtTime(0.04, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.1);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.1);
      }, beatTime * 1000);
    });
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  isMutedState() {
    return this.isMuted;
  }
}

// Создаём глобальный экземпляр
export const audioManager = new AudioManager();
