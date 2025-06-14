
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GameState } from './MolaMolaGame';
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
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ gameState, onGameEnd, onStateUpdate, onMobileControl, isMobile }: GameCanvasProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameEngineRef = useRef<GameEngine | null>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    useEffect(() => {
      if (!canvasRef.current) return;
      let resizeTimeout: NodeJS.Timeout | undefined;

      function resizeCanvas() {
        const canvas = canvasRef.current!;
        if (isMobile) {
          // 90px запас под виртуальные кнопки, гарантируем покрытие
          const { width, height } = getSafeScreenSize();
          let controlsReserved = 90;
          let croppedHeight = height - controlsReserved;
          croppedHeight = Math.max(200, croppedHeight); // не даём уйти ниже минимума

          // Соотношение 16:9 (ширина к высоте)
          const targetRatio = 9 / 16;
          let finalWidth = width;
          let finalHeight = croppedHeight;

          if (finalWidth / finalHeight > targetRatio) {
            finalWidth = finalHeight * targetRatio;
          } else {
            finalHeight = finalWidth / targetRatio;
          }

          finalWidth = Math.min(finalWidth, width);
          finalHeight = Math.min(finalHeight, croppedHeight);

          canvas.width = Math.round(finalWidth);
          canvas.height = Math.round(finalHeight);
          canvas.style.width = `${finalWidth}px`;
          canvas.style.height = `${finalHeight}px`;
          canvas.style.touchAction = 'none';
          canvas.style.userSelect = 'none';
          canvas.style.borderRadius = '0px';
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
          canvas.style.background = 'linear-gradient(to bottom, #2563eb, #1e3a8a)';
        } else {
          // Для десктопа — максимум 800x450, либо вписываться в родителя (100vw/100vh)
          let baseWidth = 800;
          let baseHeight = 450;
          const { width, height } = getSafeScreenSize();
          let scale = Math.min(width / baseWidth, height / baseHeight, 1);
          let finalWidth = Math.round(baseWidth * scale);
          let finalHeight = Math.round(baseHeight * scale);

          canvas.width = finalWidth;
          canvas.height = finalHeight;
          canvas.style.width = `${finalWidth}px`;
          canvas.style.height = `${finalHeight}px`;
          canvas.style.borderRadius = '16px';
          canvas.style.background = '';
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
        }
      }

      resizeCanvas();
      const debouncedResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 120);
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
        gameEngineRef.current = new GameEngine(canvas, ctx, {
          onGameEnd,
          onStateUpdate,
          initialState: gameState
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
          borderRadius: isMobile ? 0 : 16,
          background: isMobile
            ? 'linear-gradient(to bottom, #2563eb, #1e3a8a)'
            : undefined,
        }}
      />
    );
  }
);

export default GameCanvas;
