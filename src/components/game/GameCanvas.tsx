import React, { useRef, useEffect } from 'react';
import { GameState } from './MolaMolaGame';
import { GameEngine } from './GameEngine';

interface GameCanvasProps {
  gameState: GameState;
  onGameEnd: (victory: boolean, finalStats: Partial<GameState>) => void;
  onStateUpdate: (updates: Partial<GameState>) => void;
}

const GameCanvas = ({ gameState, onGameEnd, onStateUpdate }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 450;

    // ВНИМАНИЕ: GameEngine создаётся ТОЛЬКО ПРИ МОНТИРОВАНИИ, не перезапускается на каждый апдейт gameState!
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

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-gradient-to-b from-blue-600 to-blue-800"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;
