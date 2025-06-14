import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GameState } from './types';
import { GameEngine } from './GameEngine';

// Универсальная функция для получения максимальных реальных размеров видимой части экрана
const getSafeScreenSize = () => {
  const width = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth || 0,
    window.screen.width || 0
  );
  const height = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight || 0,
    window.screen.height || 0
  );
  return { width, height };
};

interface GameCanvasProps {
  gameState: GameState;
  onGameEnd: (victory: boolean, finalStats: Partial<GameState>) => void;
  onStateUpdate: (updates: Partial<GameState>) => void;
  onMobileControl?: (control: string, state: boolean) => void;
  isMobile?: boolean;
  username?: string; // добавим username как отдельный проп
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ gameState, onGameEnd, onStateUpdate, onMobileControl, isMobile, username }: GameCanvasProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameEngineRef = useRef<GameEngine | null>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    useEffect(() => {
      if (!canvasRef.current) return;
      let resizeTimeout: NodeJS.Timeout | undefined;

      function resizeCanvas() {
        const canvas = canvasRef.current!;
        const parent = canvas.parentElement;
        const { width: screenW, height: screenH } = getSafeScreenSize();
        const targetRatio = 16 / 9;

        // Определяем доступный размер canvas из контейнера или viewport (чтобы никогда не "выпирал" за пределы)
        let maxWidth = (parent?.clientWidth ?? screenW);
        let maxHeight = (parent?.clientHeight ?? screenH);

        // Всегда максимально центрируем, canvas не вылазит за границы
        let finalWidth = maxWidth;
        let finalHeight = maxWidth / targetRatio;
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = finalHeight * targetRatio;
        }

        // Округляем до целого
        finalWidth = Math.round(finalWidth);
        finalHeight = Math.round(finalHeight);

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Стили для центрирования и корректного растяжения
        canvas.style.width = `${finalWidth}px`;
        canvas.style.height = `${finalHeight}px`;
        canvas.style.maxWidth = "100vw";
        canvas.style.maxHeight = "100vh";
        canvas.style.display = 'block';
        canvas.style.margin = "auto";
        canvas.style.position = "relative"; // помогает центрировать в flex-контейнере
        canvas.style.background = isMobile
          ? 'linear-gradient(to bottom, #2563eb, #1e3a8a)'
          : '';
        canvas.style.borderRadius = isMobile ? '0px' : '16px';
        canvas.style.boxShadow = isMobile ? 'none' : '0 4px 24px rgba(0,0,0,0.18)';
        canvas.style.touchAction = 'none';
        canvas.style.userSelect = 'none';
      }

      resizeCanvas();
      const debouncedResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 80);
      };

      window.addEventListener('resize', debouncedResize);
      window.addEventListener('orientationchange', debouncedResize);

      return () => {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('orientationchange', debouncedResize);
        if (resizeTimeout) clearTimeout(resizeTimeout);
      };
    }, [isMobile]);

    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!gameEngineRef.current) {
        // проксируем username (и прочее без изменений)
        gameEngineRef.current = new GameEngine(canvas, ctx, {
          onGameEnd,
          onStateUpdate,
          initialState: { ...gameState, username }, // пробрасываем username; GameEngine корректно обработает
        });
        gameEngineRef.current.start();
      }
      return () => {
        if (gameEngineRef.current) {
          gameEngineRef.current.stop();
          gameEngineRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (!gameEngineRef.current) return;
      if (!onMobileControl) return;

      const handleMobileControl = (control: string, state: boolean) => {
        gameEngineRef.current?.setMobileControlState(control, state);
        onMobileControl(control, state);
      };

      (window as any).__molaMobileHandle = handleMobileControl;
    }, [onMobileControl]);

    const handleMobileControl = (control: string, state: boolean) => {
      if (gameEngineRef.current) {
        gameEngineRef.current.setMobileControlState(control, state);
      }
      if (onMobileControl) onMobileControl(control, state);
    };

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-b from-blue-600 to-blue-800 touch-none select-none"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    );
  }
);

export default GameCanvas;
