
import React, { useRef, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const { playerData } = useGame();

  // Применяем новый хук для адаптивного canvas и вычисленного масштаба
  const { containerRef, canvasRef, scale } = useGameCanvasResize();

  // Передать scale при необходимости вашему GameEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    let cancelled = false;

    async function setupEngine() {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (engineRef.current) {
            engineRef.current.stop();
            engineRef.current = null;
          }
          const engine = new GameEngine(canvas, ctx, {
            onGameEnd,
            onStateUpdate,
            initialState: {
              ...gameState,
              username,
              ...playerData,
            },
            scaleFactor: scale,
          });
          engineRef.current = engine;
          collectEngineRef?.(engine);
          setLoading(true);
          console.log('[GameCanvas] Waiting for engine initialization...');
          await engine.init();
          console.log('GameEngine и все ассеты загружены!');
          if (cancelled) return;
          setLoading(false);
          if (!isPaused) engine.start();
        }
      }
    }

    setupEngine();
    return () => {
      cancelled = true;
      engineRef.current?.stop();
      engineRef.current = null;
    };
    // eslint-disable-next-line
  }, [gameState, username, gameSessionId, scale]);

  useEffect(() => {
    if (engineRef.current && !loading) {
      if (isPaused) {
        engineRef.current.stop();
      } else {
        engineRef.current.start();
      }
    }
  }, [isPaused, loading]);

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
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 z-10">
          Loading...
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
