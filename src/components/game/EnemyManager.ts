
export class EnemyManager {
  bossLucia: any = null;
  enemies: any[] = [];
  canvas: HTMLCanvasElement;
  player: any;
  callbacks: any;
  constructor({ bossLucia, enemies, canvas, player, callbacks }: any) {
    this.bossLucia = bossLucia;
    this.enemies = enemies;
    this.canvas = canvas;
    this.player = player;
    this.callbacks = callbacks;
  }
  // Здесь можно реализовать передачу enemy, например spawn, update, remove и др.
}
