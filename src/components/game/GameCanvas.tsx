
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GameState } from './MolaMolaGame';
import { GameEngine } from './GameEngine';

interface GameCanvasProps {
  gameState: GameState;
  onGameEnd: (victory: boolean, finalStats: Partial<GameState>) => void;
  onStateUpdate: (updates: Partial<GameState>) => void;
  onMobileControl?: (control: string, state: boolean) => void;
  isMobile?: boolean;
}

const getSafeMobileScreenSize = () => {
  // Берём самое большое из всех возможных значений высоты — актуально для iOS/Safari
  const width = window.innerWidth;
  const height = Math.max(
    window.innerHeight,
    document.documentElement.clientHeight || 0,
    window.screen.height || 0
  );
  return { width, height };
};

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
          // 90px — запас под контролы, но гарантируем полное перекрытие
          const { width, height } = getSafeMobileScreenSize();
          let croppedHeight = height - 90;
          const targetRatio = 9 / 16;
          let finalWidth = width;
          let finalHeight = croppedHeight;

          // Fit в 9:16
          if (finalWidth / finalHeight > targetRatio) {
            finalWidth = finalHeight * targetRatio;
          } else {
            finalHeight = finalWidth / targetRatio;
          }
          // Ограничение, чтобы холст не был выше/шире экрана
          finalWidth = Math.min(finalWidth, width);
          finalHeight = Math.min(finalHeight, croppedHeight);

          canvas.width = Math.round(finalWidth);
          canvas.height = Math.round(finalHeight);
          canvas.style.width = `${finalWidth}px`;
          canvas.style.height = `${finalHeight}px`;
          canvas.style.touchAction = 'none';
          canvas.style.userSelect = 'none';
          canvas.style.borderRadius = '16px';
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
          canvas.style.background = 'linear-gradient(to bottom, #2563eb, #1e3a8a)';
        } else {
          canvas.width = 800;
          canvas.height = 450;
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.borderRadius = '';
          canvas.style.background = '';
        }
      }

      resizeCanvas();
      const debouncedResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => resizeCanvas(), 180);
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

    // Новый обработчик!
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
          borderRadius: isMobile ? 16 : undefined,
          background: isMobile
            ? 'linear-gradient(to bottom, #2563eb, #1e3a8a)'
            : undefined,
        }}
      />
    );
  }
);

export default GameCanvas;

