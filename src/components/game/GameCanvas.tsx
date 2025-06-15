
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { playerData } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      // Для мобильной версии увеличиваем внутренний размер canvas в 3.2 раза для масштабирования 0.3125x
      if (isMobile) {
        canvas.width = width * 3.2;
        canvas.height = height * 3.2;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      resizeCanvas(); // Initial resize
    }

    return () => {
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
    };
  }, [isMobile]);

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
        // Передаем ref наружу, если требуется
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
    <canvas
      ref={canvasRef}
      tabIndex={0}
      className="absolute inset-0 w-full h-full bg-[#011b2e] outline-none"
      style={{
        touchAction: "pinch-zoom",
        transform: isMobile ? "scale(0.3125)" : "scale(1)",
        transformOrigin: "top left"
      }}
    />
  );
};

export default GameCanvas;
