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

  // Высота и ширина теперь строго 100vw x 100svh (landscape), без паддингов!
  useEffect(() => {
    function resizeCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Используем полный экран всегда
      let width = window.innerWidth;
      let height = window.innerHeight;
      // Безопасные зоны (iOS notch и т.д.)
      const safeTop = Number(getComputedStyle(document.documentElement).getPropertyValue('--sat') || 0);
      const safeBottom = Number(getComputedStyle(document.documentElement).getPropertyValue('--sab') || 0);

      width = window.innerWidth;
      height = window.innerHeight - safeTop - safeBottom;
      if (height < 160) height = 160;
      // Обновляем canvas на весь экран
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "100vw";
      canvas.style.height = "100svh";
      canvas.style.maxWidth = "100vw";
      canvas.style.maxHeight = "100svh";
      canvas.style.display = "block";
      canvas.style.border = "none";
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 120);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

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
      className="w-[100vw] h-[100svh] max-w-none max-h-none flex-auto rounded-none shadow-none outline-none bg-[#011b2e]"
      style={{
        margin: "0",
        padding: "0",
        minHeight: "0",
        minWidth: "0",
        maxWidth: "100vw",
        maxHeight: "100svh",
        width: "100vw",
        height: "100svh",
        boxSizing: "border-box",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "pinch-zoom"
      }}
    />
  );
};

export default GameCanvas;
