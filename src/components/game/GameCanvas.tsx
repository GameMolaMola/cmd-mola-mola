
import React, { useEffect, useRef } from "react";
import { GameEngine } from "./GameEngine";
import { useGame } from "@/contexts/GameContext";

// Базовые размеры игровой области — не меняются!
const GAME_BASE_WIDTH = 1280;
const GAME_BASE_HEIGHT = 720;
const GAME_ASPECT_RATIO = GAME_BASE_WIDTH / GAME_BASE_HEIGHT;

interface GameCanvasProps {
  gameState: any;
  onGameEnd: (victory: boolean, stats: any) => void;
  onStateUpdate: (updates: any) => void;
  isMobile?: boolean;
  username?: string;
  isPaused?: boolean;
  gameSessionId?: number;
  collectEngineRef?: (engine: GameEngine | null) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameEnd,
  onStateUpdate,
  isMobile,
  username,
  isPaused = false,
  gameSessionId,
  collectEngineRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { playerData } = useGame();

  // Debounced resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let resizeTimeout: number | undefined;

    function getSafeAreaSize() {
      // Определяем максимально доступную зону, учитывая safe area/inset
      let width = window.innerWidth;
      let height = window.innerHeight;

      // Используем visualViewport, если доступен (лучше работает с динамической клавиатурой на мобильных)
      if (window.visualViewport) {
        width = window.visualViewport.width;
        height = window.visualViewport.height;
      }

      const style = getComputedStyle(container);
      let paddingTop = parseFloat(style.getPropertyValue('padding-top')) || 0;
      let paddingBottom = parseFloat(style.getPropertyValue('padding-bottom')) || 0;
      let paddingLeft = parseFloat(style.getPropertyValue('padding-left')) || 0;
      let paddingRight = parseFloat(style.getPropertyValue('padding-right')) || 0;

      width = width - paddingLeft - paddingRight;
      height = height - paddingTop - paddingBottom;

      return { width, height };
    }

    function resizeCanvas() {
      if (!canvas || !container) return;

      const { width: areaW, height: areaH } = getSafeAreaSize();

      // Стратегия "Contain" (вписывание): выбираем минимальный масштаб, весь контент canvas всегда виден
      const scale = Math.min(areaW / GAME_BASE_WIDTH, areaH / GAME_BASE_HEIGHT);

      const drawWidth = Math.round(GAME_BASE_WIDTH * scale);
      const drawHeight = Math.round(GAME_BASE_HEIGHT * scale);

      // Центрирование canvas по контейнеру
      canvas.style.width = `${drawWidth}px`;
      canvas.style.height = `${drawHeight}px`;
      canvas.width = GAME_BASE_WIDTH;
      canvas.height = GAME_BASE_HEIGHT;

      // Обеспечиваем центральное позиционирование через flex (можно через margin auto, но тут — flex)
      // Контейнер должен быть flex-центрован изначально

      // Рекомендация для pixel-art: сохранять image-rendering: pixelated;
      canvas.style.imageRendering = 'pixelated';

      // Интеграция с игровым движком: scaleFactor может быть проброшен при необходимости
      // Например, можно добавить: engineRef.current?.setScaleFactor?.(scale);

      // Вспомогательные сообщения
      if (Math.abs(drawWidth - areaW) > 3 || Math.abs(drawHeight - areaH) > 3) {
        // Есть черные полосы на экране, но это нормально для "contain"
        console.info(
          '[SAFE ZONE]: Letterboxing: Canvas:',
          drawWidth, 'x', drawHeight, '| Area:', areaW, 'x', areaH, '| Scale:', scale.toFixed(3)
        );
      } else {
        console.info(
          '[SAFE ZONE]: Full coverage: Canvas:',
          drawWidth, 'x', drawHeight, '| Area:', areaW, 'x', areaH, '| Scale:', scale.toFixed(3)
        );
      }
    }

    function debouncedResize() {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 180);
    }

    // Safe area через JS + Tailwind (дополняет стили)
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
    };
  }, []);

  // Повторная инициализация движка при смене состояния или игрока
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (engineRef.current) {
          engineRef.current.stop();
          engineRef.current = null;
        }
        engineRef.current = new GameEngine(canvas, ctx, {
          onGameEnd,
          onStateUpdate,
          initialState: {
            ...gameState,
            username,
            ...playerData,
          },
        });
        collectEngineRef?.(engineRef.current);
        if (!isPaused) engineRef.current.start();
      }
    }
    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
    // eslint-disable-next-line
  }, [gameState, username, gameSessionId]);

  useEffect(() => {
    if (engineRef.current) {
      if (isPaused) {
        engineRef.current.stop();
      } else {
        engineRef.current.start();
      }
    }
  }, [isPaused]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-[#011b2e] outline-none flex items-center justify-center"
      style={{
        touchAction: "manipulation",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        paddingTop: "env(safe-area-inset-top,0px)",
        paddingBottom: "env(safe-area-inset-bottom,0px)",
        paddingLeft: "env(safe-area-inset-left,0px)",
        paddingRight: "env(safe-area-inset-right,0px)",
        willChange: "transform"
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        id="game-canvas"
        className="block outline-none"
        style={{
          background: "#011b2e",
          display: "block",
          border: "none",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

export default GameCanvas;
