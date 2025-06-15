
import React, { useRef, useEffect } from "react";
import { GameEngine } from "./GameEngine";
import { useGame } from "@/contexts/GameContext";
import { useGameCanvasResize } from "./useGameCanvasResize";

// Базовые размеры вынесены в useGameCanvasResize
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
  const engineRef = useRef<GameEngine | null>(null);
  const { playerData } = useGame();

  // Применяем новый хук для адаптивного canvas и вычисленного масштаба
  const { containerRef, canvasRef, scale } = useGameCanvasResize();

  // Передать scale при необходимости вашему GameEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Always pass 7 arguments to GameEngine!
        if (engineRef.current) {
          engineRef.current.stop();
          engineRef.current = null;
        }
        engineRef.current = new GameEngine(
          canvas,
          (state) => onStateUpdate(state),
          (score) => onGameEnd(false, { score }),    // onGameOver
          (score) => onGameEnd(true, { score }),     // onGameWin
          () => {}, // onShowPowerUp (replace with actual handler if needed)
          () => {}, // onRemovePowerUp (replace with actual handler if needed)
          () => {}  // onBossHealthUpdate (replace with actual handler if needed)
        );
        collectEngineRef?.(engineRef.current);
        if (!isPaused) engineRef.current.start();
      }
    }
    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
    // eslint-disable-next-line
  }, [gameState, username, gameSessionId, scale]);

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
        touchAction: "manipulation",
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
