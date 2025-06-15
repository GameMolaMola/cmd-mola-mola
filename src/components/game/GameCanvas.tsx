
import React, { useEffect, useRef } from "react";
import { GameEngine } from "./GameEngine";
import { useGame } from "@/contexts/GameContext";

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

const GAME_BASE_WIDTH = 1280;
const GAME_BASE_HEIGHT = 720;
const GAME_ASPECT_RATIO = GAME_BASE_WIDTH / GAME_BASE_HEIGHT;

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

  // Debounced resize for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let resizeTimeout: number | undefined;

    // Получает доступный размер с учетом Safe Area и visualViewport
    function getSafeAreaSize() {
      let width = window.innerWidth;
      let height = window.innerHeight;

      // iOS: учитываем safe area
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
      const screenAR = areaW / areaH;

      let drawWidth, drawHeight;

      if (screenAR > GAME_ASPECT_RATIO) {
        // fill by height, horizontal cut
        drawHeight = areaH;
        drawWidth = areaH * GAME_ASPECT_RATIO;
      } else {
        // fill by width, vertical cut
        drawWidth = areaW;
        drawHeight = areaW / GAME_ASPECT_RATIO;
      }

      // внутренние размеры для рендеринга (Retina-friendly, можно увеличить)
      // Заполняет максимально, даже если обрежется!
      // Важно: если нужен superHD - умножать drawWidth/Height на devicePixelRatio
      canvas.style.width = `${drawWidth}px`;
      canvas.style.height = `${drawHeight}px`;
      canvas.width = Math.round(drawWidth);
      canvas.height = Math.round(drawHeight);

      // Safe zone info: если что-то было обрезано — предупреждаем
      if (Math.abs(drawWidth - areaW) > 1 || Math.abs(drawHeight - areaH) > 1) {
        console.warn(
          '[SAFE ZONE WARN] Game view cropped! Draw:', 
          Math.round(drawWidth), 'x', Math.round(drawHeight),
          '| Screen:', Math.round(areaW), 'x', Math.round(areaH)
        );
      }
    }

    // Debounce
    function debouncedResize() {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 150);
    }

    // Стили для Safe Area через JS (дополняет существующие Tailwind классы)
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

  // Повторная инициализация движка при смене основного состояния, уровня, игрока и т.д.
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
        touchAction: "manipulation", // критично для touch устройств
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

