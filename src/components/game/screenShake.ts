
export class ScreenShake {
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTime: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;

  update(deltaTime: number) {
    if (this.shakeTime > 0) {
      this.shakeTime -= deltaTime;
      
      if (this.shakeTime <= 0) {
        this.shakeIntensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
      } else {
        // Calculate shake intensity falloff
        const progress = 1 - (this.shakeTime / this.shakeDuration);
        const currentIntensity = this.shakeIntensity * (1 - progress);
        
        // Generate random shake offset
        this.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
        this.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
      }
    }
  }

  // Start screen shake with intensity and duration
  shake(intensity: number, duration: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = duration;
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  // Apply shake offset to canvas context
  applyShake(ctx: CanvasRenderingContext2D) {
    if (this.shakeIntensity > 0) {
      ctx.translate(this.offsetX, this.offsetY);
    }
  }

  // Reset shake offset (call after rendering)
  resetShake(ctx: CanvasRenderingContext2D) {
    if (this.shakeIntensity > 0) {
      ctx.translate(-this.offsetX, -this.offsetY);
    }
  }

  // Get current shake values for debugging
  getShakeValues() {
    return {
      intensity: this.shakeIntensity,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      timeLeft: this.shakeTime
    };
  }
}
