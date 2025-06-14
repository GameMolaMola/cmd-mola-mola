
import { drawPixelSand } from './drawPixelSand';

export function createStaticSandLayer(
  width: number,
  height: number
): HTMLCanvasElement {
  const sandCanvas = document.createElement('canvas');
  sandCanvas.width = width;
  sandCanvas.height = height;
  const sandCtx = sandCanvas.getContext('2d');
  if (sandCtx) {
    drawPixelSand(sandCtx, 0, 0, width, height);
  }
  return sandCanvas;
}
