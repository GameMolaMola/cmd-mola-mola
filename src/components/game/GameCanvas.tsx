
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

    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Мобильный адаптив — стараемся подогнать под 9:16 если isMobile
      if (isMobile) {
        // fit 9:16 в 100vw-80px по высоте
        let width = window.innerWidth;
        let height = window.innerHeight - 80; // под контролы
        const targetRatio = 9 / 16;
        // Fit canvas to 9:16, центр на экране
        if (width / height > targetRatio) {
          width = height * targetRatio;
        } else {
          height = width / targetRatio;
        }
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      } else {
        canvas.width = 800;
        canvas.height = 450;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }

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

    // Мобильное управление — пробрасываем управление в GameEngine
    useEffect(() => {
      if (!gameEngineRef.current || !onMobileControl) return;
      gameEngineRef.current.setMobileControlCallback(onMobileControl);
    }, [onMobileControl]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-b from-blue-600 to-blue-800 touch-none select-none"
        style={{ imageRendering: 'pixelated', borderRadius: isMobile ? 12 : undefined }}
      />
    );
  }
);

export default GameCanvas;
