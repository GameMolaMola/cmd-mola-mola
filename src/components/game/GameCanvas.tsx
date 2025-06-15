
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

  // === Динамическая высота canvas с учетом safe area и scroll ===
  useEffect(() => {
    function resizeCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // На мобильных делаем 100vw x 56vw (2:1 = landscape), но не более родителя!
      const isPortrait = window.innerHeight > window.innerWidth;
      let width = Math.min(window.innerWidth, 900);
      let height = Math.round(width * 0.5);

      // Если слишком мало места — делаем высоту по максимуму
      const safeTop = Number(getComputedStyle(document.documentElement).getPropertyValue('--sat') || 0);
      const safeBottom = Number(getComputedStyle(document.documentElement).getPropertyValue('--sab') || 0);

      // Высота с учетом возможных панелей
      let minHeight = 220;
      if (window.innerHeight < height + 100) {
        height = window.innerHeight - 48 - safeTop - safeBottom;
      }
      if (isPortrait) {
        // В портретном режиме ужимаем под safe area максимально — при этом game не отображается, но canvas не обрезать!
        width = Math.min(window.innerWidth, 900);
        height = Math.round(width * 0.62);
        minHeight = 160;
      }
      canvas.width = width;
      canvas.height = Math.max(height, minHeight);
      // Убедимся что canvas максимально видим на мобилках, нет "обреза"
      canvas.style.maxWidth = "900px";
      canvas.style.width = "100vw";
      canvas.style.height = `${Math.max(height, minHeight)}px`;
      canvas.style.display = "block";
      // лишняя рамка убираем
      canvas.style.border = "none";
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // иногда браузеру надо подождать
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
      className="
        w-full max-w-full flex-auto rounded-2xl shadow-xl outline-none bg-[#011b2e]
        "
      style={{
        margin: "0 auto",
        minHeight: "160px",
        maxWidth: "900px",
        // Фон + отступы под safe-area
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "pinch-zoom"
      }}
    />
  );
};

export default GameCanvas;
