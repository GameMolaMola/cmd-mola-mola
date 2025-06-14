
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
  gameSessionId?: number;
  collectEngineRef?: (engine: GameEngine | null) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameEnd,
  onStateUpdate,
  onMobileControl,
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

  // canvas теперь всегда flex-auto, не absolute. Высота минимальная (на мобильных) вычисляется автоматически.
  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={450}
      className="w-full max-w-full max-h-[58vw] min-h-[220px] flex-auto rounded-2xl shadow-xl outline-none bg-[#011b2e]"
      style={{
        display: "block",
        margin: "0 auto",
        boxShadow: "0 2px 20px 0px #001a3a80",
        // высота автоматически для резины на мобильных
        touchAction: "none",
      }}
      tabIndex={0}
    />
  );
};

export default GameCanvas;

