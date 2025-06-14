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

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ gameState, onGameEnd, onStateUpdate, onMobileControl, isMobile }: GameCanvasProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameEngineRef = useRef<GameEngine | null>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    // Мобильное: resize canvas всегда при изменении размеров окна
    useEffect(() => {
      if (!canvasRef.current) return;

      function resizeCanvas() {
        const canvas = canvasRef.current!;
        // Для мобилки: fit 9:16 в всю видимую область минус контролы (но не больше 100%)
        if (isMobile) {
          // 80px под контролы (двойной запас, чтобы не было налегания)
          let width = window.innerWidth;
          // minHeight на iOS может быть чуть больше, делаем запас
          let height = Math.max(window.innerHeight, document.documentElement.clientHeight) - 90;
          const targetRatio = 9 / 16;
          if (width / height > targetRatio) {
            width = height * targetRatio;
          } else {
            height = width / targetRatio;
          }
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          // латентный tap highlight убираем
          canvas.style.touchAction = 'none';
          canvas.style.userSelect = 'none';
          // Округлённый угол лишь на мобилках
          canvas.style.borderRadius = '16px';
          // Центрирование
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
      window.addEventListener('resize', resizeCanvas);
      return () => {
        window.removeEventListener('resize', resizeCanvas);
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
      // перехватываем мобильные события и пробрасываем в движок напрямую
      if (!gameEngineRef.current) return;
      if (!onMobileControl) return;

      // Подписываем наружный callback
      const handleMobileControl = (control: string, state: boolean) => {
        gameEngineRef.current?.setMobileControlState(control, state);
        // Можно пробрасывать наружу, если это нужно (для внешней логики)
        onMobileControl(control, state);
      };

      // Для совместимости: сохраняем в рефу, чтобы на каждом рендере не пересоздавалось
      (window as any).__molaMobileHandle = handleMobileControl;
    }, [onMobileControl]);

    // Функция для проброса событий MobileControls
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
