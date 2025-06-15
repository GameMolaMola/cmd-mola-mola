
export function createDefaultPlatforms(canvasWidth: number, canvasHeight: number) {
  // Сделаем платформы ближе к полу для досягаемости прыжком
  return [
    // Пол (не трогаем)
    { x: 0, y: canvasHeight - 40, width: canvasWidth, height: 40, color: '#F87171' },
    // Самые низкие платформы — теперь ближе к земле
    { x: 80, y: canvasHeight - 110, width: 120, height: 20, color: '#7DD3FC' },
    { x: 280, y: canvasHeight - 170, width: 100, height: 20, color: '#6EE7B7' },
    { x: 480, y: canvasHeight - 110, width: 80, height: 20, color: '#FBBF24' },
    { x: 650, y: canvasHeight - 200, width: 100, height: 20, color: '#A78BFA' }
  ];
}
