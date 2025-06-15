
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

  // === Динамическая высота ===
  // Ресайз canvas в зависимости от экрана (для мобильных)
  useEffect(() => {
    function resizeCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (window.innerWidth < 900) {
        // Стараемся подогнать высоту — делаем ширину всегда 100% экрана (до 900), высоту с учетом соотношения 2:1 и safe-area-inset
        const width = Math.min(window.innerWidth, 900);
        // 450/900 = 0.5 (canvas соотношение 2:1)
        let height = Math.round(width * 0.5);
        // На мобильных маленькая высота — стараемся занять максимум доступного
        const safeTop = Number(getComputedStyle(document.documentElement).getPropertyValue('--sat') || 0);
        const safeBottom = Number(getComputedStyle(document.documentElement).getPropertyValue('--sab') || 0);
        if (window.innerHeight < height + 100) {
          height = window.innerHeight - 48 - safeTop - safeBottom;
        }
        canvas.width = width;
        canvas.height = height;
      } else {
        canvas.width = 900;
        canvas.height = 450;
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
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

  // === СТИЛИ ДЛЯ МОБИЛЬНЫХ И SAFE AREA ===
  // canvas теперь всегда максимальной ширины, высота — адаптивная, с отступами safe area
  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      className="
        w-full max-w-full flex-auto rounded-2xl shadow-xl outline-none bg-[#011b2e]
        "
      style={{
        display: "block",
        margin: "0 auto",
        boxShadow: "0 2px 20px 0px #001a3a80",
        minHeight: "220px",
        maxWidth: "900px",
        // Высота берём из самого элемента, а внешние safe-area инлайн сверху/снизу
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "none",
      }}
    />
  );
};

export default GameCanvas;

