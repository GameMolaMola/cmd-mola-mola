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
import { makeInitialGameState } from "./makeInitialGameState";
import { useMobileControls } from "./useMobileControls";
import { useGameReset } from "./useGameReset";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

function isEqualHud(a: any, b: any) {
  // HUD считается тем же самым, если все ключевые показатели совпадают
  return (
    a.health === b.health &&
    a.ammo === b.ammo &&
    a.coins === b.coins &&
    a.level === b.level
  );
}

const MolaMolaGame = ({ autoStart = false }: { autoStart?: boolean }) => {
  const { playerData, language } = useGame();
  const freeBrasilena = useFreeBrasilena();
  const t = useTranslations(language);

  const username =
    typeof playerData?.nickname === "string"
      ? playerData.nickname
      : typeof playerData?.email === "string"
      ? playerData.email
      : undefined;

  // Хук сброса и состояния игры
  const {
    hud, setHud,
    initialGameState, setInitialGameState,
    gameSessionId, setGameSessionId,
    gameEnded, setGameEnded,
    victory, setVictory,
    finalStats, setFinalStats,
    isPaused, setIsPaused,
    resetGame,
  } = useGameReset(playerData);

  // Показываем мобильные контролы
  const showMobileControls = useMobileControls(gameEnded);

  React.useEffect(() => {
    if (showMobileControls) {
      console.log("Mobile controls are enabled: управление осуществляется с мобильного устройства или Telegram браузера.");
    } else {
      console.log("Desktop controls: управление осуществляется с ПК/ноутбука.");
    }
  }, [showMobileControls]);

  // Сброс по изменению user/playerData
  React.useEffect(() => {
    setInitialGameState(makeInitialGameState());
    setGameSessionId(Date.now());
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setIsPaused(false);
  }, [playerData, setInitialGameState, setGameSessionId, setGameEnded, setVictory, setFinalStats, setIsPaused]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyP" && !gameEnded) {
        setIsPaused((v: boolean) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameEnded, setIsPaused]);

  React.useEffect(() => {
    if (!gameEnded) setIsPaused(false);
  }, [gameEnded, setIsPaused]);

  const onPause = () => {
    if (!gameEnded) setIsPaused((p: boolean) => !p);
  };

  // обновляем HUD без score, только если значения действительно изменились и не выставляем некорректные:
  const onStateUpdate = (updates: any) => {
    setHud((prev: any) => {
      const safeUpdates = updates ?? {};
      // Новые значения только если они ЧИСЛОВЫЕ, не NaN и изменились
      let changed = false;
      let nextHud = { ...prev };

      if (
        typeof safeUpdates.health === "number" &&
        isFinite(safeUpdates.health) &&
        safeUpdates.health !== prev.health
      ) {
        nextHud.health = safeUpdates.health;
        changed = true;
      }
      if (
        typeof safeUpdates.ammo === "number" &&
        isFinite(safeUpdates.ammo) &&
        safeUpdates.ammo !== prev.ammo
      ) {
        nextHud.ammo = safeUpdates.ammo;
        changed = true;
      }
      if (
        typeof safeUpdates.coins === "number" &&
        isFinite(safeUpdates.coins) &&
        safeUpdates.coins !== prev.coins
      ) {
        // clamp coins: 0..1000
        nextHud.coins = Math.max(0, Math.min(1000, safeUpdates.coins));
        changed = true;
      }
      if (
        typeof safeUpdates.level === "number" &&
        isFinite(safeUpdates.level) &&
        safeUpdates.level !== prev.level
      ) {
        nextHud.level = safeUpdates.level;
        changed = true;
      }

      // Не обновляем HUD если ничего реально не поменялось
      if (!changed || isEqualHud(nextHud, prev)) {
        return prev;
      }

      // Логирование для контроля
      console.info("[HUD update] from", prev, "to", nextHud);

      return nextHud;
    });
  };

  // КРИТИЧНО: остановить движение и UI при gameEnded
  const handleGameEnd = (isVictory: boolean, stats: any) => {
    setGameEnded(true);
    setVictory(isVictory);
    setFinalStats(stats); // теперь просто { level, coins }
    setIsPaused(false);
    setGameSessionId(Date.now());
    console.log("[GameEnd] Triggered: victory=", isVictory, "stats=", stats, "gameSessionId=", gameSessionId);
  };

  // Сброс игры через хук
  const handleRestart = () => {
    resetGame();
    // Доп.логирование для отладки
    console.log("[handleRestart] Reset game state through hook");
  };

  // Engine ref и мобильные контролы
  const lastGameEngine = useRef<any>(null);
  const collectEngineRef = (engineInstance: any) => {
    lastGameEngine.current = engineInstance;
  };
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
          isPaused={isPaused || gameEnded}
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
      <MolaMolaGameEndDialog
        open={gameEnded}
        victory={victory}
        stats={{
          level: hud.level,
          coins: hud.coins
        }}
        onRestart={handleRestart}
      />
      <PauseOverlay visible={isPaused && !gameEnded} />
    </div>
  );
};

export default MolaMolaGame;
