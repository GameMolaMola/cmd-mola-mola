
export function createDefaultPlatforms(canvasWidth: number, canvasHeight: number) {
  return [
    { x: 0, y: canvasHeight - 40, width: canvasWidth, height: 40, color: '#F87171' },
    { x: 300, y: 350, width: 120, height: 20, color: '#7DD3FC' },
    { x: 500, y: 280, width: 100, height: 20, color: '#6EE7B7' },
    { x: 150, y: 220, width: 80, height: 20, color: '#FBBF24' },
    { x: 650, y: 200, width: 100, height: 20, color: '#A78BFA' }
  ];
}
