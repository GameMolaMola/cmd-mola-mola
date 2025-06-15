
import { useRef, useEffect, useCallback, useState } from "react";

const GAME_BASE_WIDTH = 1280;
const GAME_BASE_HEIGHT = 720;
const GAME_ASPECT_RATIO = GAME_BASE_WIDTH / GAME_BASE_HEIGHT;

interface UseGameCanvasResizeResult {
  containerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: number;
}

export function useGameCanvasResize(): UseGameCanvasResizeResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;

    // Рассчитываем safe-area insets через CSS (env или fallback в 0)
    const style = getComputedStyle(container);
    const paddingTop = parseFloat(style.getPropertyValue('padding-top')) || 0;
    const paddingBottom = parseFloat(style.getPropertyValue('padding-bottom')) || 0;
    const paddingLeft = parseFloat(style.getPropertyValue('padding-left')) || 0;
    const paddingRight = parseFloat(style.getPropertyValue('padding-right')) || 0;

    let width = window.innerWidth;
    let height = window.innerHeight;
    if (window.visualViewport) {
      width = window.visualViewport.width;
      height = window.visualViewport.height;
    }

    width = width - paddingLeft - paddingRight;
    height = height - paddingTop - paddingBottom;

    // Стратегия "Contain": вписываем canvas, возможно появятся полосы
    const containScale = Math.min(
      width / GAME_BASE_WIDTH,
      height / GAME_BASE_HEIGHT
    );
    const drawWidth = Math.round(GAME_BASE_WIDTH * containScale);
    const drawHeight = Math.round(GAME_BASE_HEIGHT * containScale);

    // Задаем размеры canvas (CSS — отображение; width/height — внутренний рендеринг)
    canvas.style.width = `${drawWidth}px`;
    canvas.style.height = `${drawHeight}px`;
    canvas.width = GAME_BASE_WIDTH;
    canvas.height = GAME_BASE_HEIGHT;

    // Центрирование canvas (через родительский flex)
    // Опционально: image-rendering для pixel art
    canvas.style.imageRendering = 'pixelated';

    setScale(containScale);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    // Safe area — дополнительно применим через JS (быстрее чем только Tailwind-стили)
    function applySafeAreaStyle() {
      if (container) {
        container.style.paddingTop = 'env(safe-area-inset-top,0px)';
        container.style.paddingBottom = 'env(safe-area-inset-bottom,0px)';
        container.style.paddingLeft = 'env(safe-area-inset-left,0px)';
        container.style.paddingRight = 'env(safe-area-inset-right,0px)';
      }
    }
    applySafeAreaStyle();
    resizeCanvas();

    let resizeTimeout: number | null = null;
    function debouncedResize() {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 180);
    }

    window.addEventListener("resize", debouncedResize);
    window.addEventListener("orientationchange", debouncedResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", debouncedResize);
      window.visualViewport.addEventListener("scroll", debouncedResize);
    }

    return () => {
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("orientationchange", debouncedResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", debouncedResize);
        window.visualViewport.removeEventListener("scroll", debouncedResize);
      }
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
    };
  }, [resizeCanvas]);

  return { containerRef, canvasRef, scale };
}
