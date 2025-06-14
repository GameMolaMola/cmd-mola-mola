
import React, { useEffect, useRef } from "react";
import { GameEngine } from "./GameEngine";
import { useGame } from "@/contexts/GameContext";

interface GameCanvasProps {
  gameState: any;
  onGameEnd: (victory: boolean, stats: any) => void;
  onStateUpdate: (updates: any) => void;
  onMobileControl?: (control: string, state: boolean) => void;
  isMobile?: boolean;
  username?: string;
  isPaused?: boolean;
  gameSessionId?: number; // новый проп (необязательный)
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameEnd,
  onStateUpdate,
  onMobileControl,
  isMobile,
  username,
  isPaused = false,
  gameSessionId // новый проп
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { playerData } = useGame();

  // Создание/рестарт экземпляра GameEngine
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
        if (!isPaused) engineRef.current.start();
      }
    }
    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
    // добавим gameSessionId в зависимости
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
    <canvas
      ref={canvasRef}
      width={900}
      height={450}
      style={{
        maxWidth: "100vw",
        maxHeight: "52vw",
        borderRadius: 16,
        background: "#011b2e",
        boxShadow: "0 2px 20px 0px #001a3a80",
      }}
      tabIndex={0}
    />
  );
};

export default GameCanvas;
