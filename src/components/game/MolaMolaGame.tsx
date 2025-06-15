
import React, { useRef, useEffect, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import GameHUD from "./hud/GameHUD";
import GameOverDialog from "./hud/GameOverDialog";
import { useFreeBrasilena } from "./useFreeBrasilena";
import MobileControls from "./MobileControls";
import GameCanvas from "./GameCanvas";
import PauseOverlay from "./PauseOverlay";
import type { GameState } from "./types";
import { useTranslations } from "@/hooks/useTranslations";
import MolaMolaHUDWrapper from "./MolaMolaHUDWrapper";
import MolaMolaGameEndDialog from "./MolaMolaGameEndDialog";
import MolaMolaMobileControlsWrapper from "./MolaMolaMobileControlsWrapper";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

function makeInitialGameState(playerLevel = 1) {
  return {
    health: 100,
    ammo: 10,
    coins: 0,
    level: playerLevel,
    powerUps: {
      speedBoost: false,
      speedBoostTime: 0,
    },
    score: 110,
    isVictory: false,
  };
}

const MolaMolaGame = ({ autoStart = false }: { autoStart?: boolean }) => {
  const [hud, setHud] = useState({ health: 100, ammo: 10, coins: 0, level: 1, score: 110 });
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSessionId, setGameSessionId] = useState<number>(() => Date.now());

  const { playerData, language } = useGame();
  const freeBrasilena = useFreeBrasilena();
  const t = useTranslations(language);

  const username =
    typeof playerData?.nickname === "string"
      ? playerData.nickname
      : typeof playerData?.email === "string"
      ? playerData.email
      : undefined;

  // --- Управляемость с мобильных телефонов ---
  const showMobileControls = (isMobileDevice() || isTelegramBrowser()) && !gameEnded;

  React.useEffect(() => {
    if (showMobileControls) {
      console.log("Mobile controls are enabled: управление осуществляется с мобильного устройства или Telegram браузера.");
    } else {
      console.log("Desktop controls: управление осуществляется с ПК/ноутбука.");
    }
  }, [showMobileControls]);

  const [initialGameState, setInitialGameState] = useState<GameState>(() =>
    makeInitialGameState()
  );

  useEffect(() => {
    setInitialGameState(makeInitialGameState());
    setGameSessionId(Date.now());
    // Сбросить флаги, если вдруг что-то зависло (safety)
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setIsPaused(false);
  }, [playerData]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyP" && !gameEnded) {
        setIsPaused((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameEnded]);

  useEffect(() => {
    if (!gameEnded) setIsPaused(false);
  }, [gameEnded]);

  const onPause = () => {
    if (!gameEnded) setIsPaused((p) => !p);
  };

  // --- обновляем HUD и score на лету ---
  const onStateUpdate = (updates: any) => {
    setHud((prev) => {
      const safeUpdates = updates ?? {};
      const coins = typeof safeUpdates.coins === "number" ? safeUpdates.coins : prev.coins;
      const level = typeof safeUpdates.level === "number" ? safeUpdates.level : prev.level;
      const score = typeof safeUpdates.score === "number"
        ? safeUpdates.score
        : coins * 10 + level * 100;
      return { ...prev, ...safeUpdates, score, level, coins };
    });
  };

  // --- КРИТИЧНО: остановить движение и UI при gameEnded, гарантировать stop движка ---
  // handleGameEnd вызывается только движком
  const handleGameEnd = (isVictory: boolean, stats: any) => {
    setGameEnded(true);
    setVictory(isVictory);
    setFinalStats(stats);
    setIsPaused(false);
    setGameSessionId(Date.now()); // Обновим любую логику gameEngine (он перезапишется новым)
    // Лог для диагностики
    console.log("[GameEnd] Triggered: victory=", isVictory, "stats=", stats, "gameSessionId=", gameSessionId);
  };

  // --- Сброс игры: флаг gameEnded сбрасывается до перезапуска канваса ---
  const handleRestart = () => {
    // ШАГ 1: Сбросить флаги в строгом порядке
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setIsPaused(false);
    // ШАГ 2: Сначала сбрасываем HUD и начальное состояние одним махом
    const initial = makeInitialGameState();
    setHud({ ...initial });
    setInitialGameState(initial);
    // ШАГ 3: Новое gameSessionId — именно ПОСЛЕ сброса состояния!
    const newSessionId = Date.now();
    setGameSessionId(newSessionId);

    // Логирование для отладки
    console.log("[handleRestart] Reset game state", {
      newSessionId,
      initial,
      flags: {
        gameEnded: false,
        victory: false,
        finalStats: null,
        isPaused: false,
      }
    });
  };

  // --- Engine ref и мобильные контролы всегда сбрасываются при gameEnded ---
  const lastGameEngine = useRef<any>(null);

  const collectEngineRef = (engineInstance: any) => {
    lastGameEngine.current = engineInstance;
  };

  // React UI-обработка мобильных контролов: НЕ активны в gameEnded!
  const handleControl = (control: string, state: boolean) => {
    if (!lastGameEngine.current || gameEnded) return;
    if (typeof lastGameEngine.current.setMobileControlState === "function") {
      lastGameEngine.current.setMobileControlState(control, state);
    }
  };

  return (
    <div
      className="w-screen bg-[#011b2e] relative flex flex-col overflow-hidden"
      style={{
        height: '100svh',
      }}
      tabIndex={-1}
    >
      <div 
        className="z-10 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <MolaMolaHUDWrapper
          hud={hud}
          isMobile={showMobileControls}
          onPause={onPause}
        />
      </div>
      
      <div className="relative flex-1">
        <GameCanvas
          key={gameSessionId}
          gameState={initialGameState}
          onGameEnd={handleGameEnd}
          onStateUpdate={onStateUpdate}
          isMobile={showMobileControls}
          username={username}
          isPaused={isPaused || gameEnded}  // <--- ВАЖНО: всегда пауза если gameEnded
          gameSessionId={gameSessionId}
          collectEngineRef={collectEngineRef}
        />
      </div>

      <div 
        className="z-10 shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <MolaMolaMobileControlsWrapper show={showMobileControls} onControl={handleControl} />
      </div>

      {/* Game End Dialog всегда настолько выше, что UI не мешает! */}
      <MolaMolaGameEndDialog
        open={gameEnded}
        victory={victory}
        stats={{
          level: hud.level,
          coins: hud.coins,
          score: hud.score
        }}
        onRestart={handleRestart}
      />
      <PauseOverlay visible={isPaused && !gameEnded} />
    </div>
  );
};

export default MolaMolaGame;

