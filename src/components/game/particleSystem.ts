
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'explosion' | 'coin' | 'impact' | 'muzzle';
}

export class ParticleSystem {
  private particles: Particle[] = [];

  update(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx * deltaTime * 0.016;
      particle.y += particle.vy * deltaTime * 0.016;
      
      // Update life
      particle.life -= deltaTime;
      particle.alpha = particle.life / particle.maxLife;
      
      // Apply gravity for explosion particles
      if (particle.type === 'explosion') {
        particle.vy += 0.3;
      }
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      
      if (particle.type === 'muzzle') {
        // Draw muzzle flash as a star-like shape
        this.drawStar(ctx, particle.x, particle.y, particle.size);
      } else {
        // Draw regular particles as circles
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    const spikes = 6;
    const step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    
    for (let i = 0; i <= spikes * 2; i++) {
      const radius = i % 2 === 0 ? size : size * 0.5;
      const angle = i * step - Math.PI / 2;
      ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    
    ctx.closePath();
    ctx.fill();
  }

  // Create explosion particles
  createExplosion(x: number, y: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 50 + Math.random() * 100;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 500 + Math.random() * 300,
        maxLife: 800,
        size: 2 + Math.random() * 3,
        color: `hsl(${Math.random() * 60 + 15}, 100%, 60%)`, // Orange to yellow
        alpha: 1,
        type: 'explosion'
      });
    }
  }

  // Create coin collection particles
  createCoinEffect(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 40;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 400 + Math.random() * 200,
        maxLife: 600,
        size: 1 + Math.random() * 2,
        color: '#FFD700',
        alpha: 1,
        type: 'coin'
      });
    }
  }

  // Create bullet impact particles
  createImpact(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 30;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 200 + Math.random() * 100,
        maxLife: 300,
        size: 1 + Math.random() * 1.5,
        color: '#FF6B6B',
        alpha: 1,
        type: 'impact'
      });
    }
  }

  // Create muzzle flash
  createMuzzleFlash(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 100,
      maxLife: 100,
      size: 8 + Math.random() * 4,
      color: '#FFFF88',
      alpha: 1,
      type: 'muzzle'
    });
  }

  // Clear all particles
  clear() {
    this.particles = [];
  }
}
