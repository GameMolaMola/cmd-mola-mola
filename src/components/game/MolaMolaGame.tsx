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

  // Добавим реф-флаг чтобы отслеживать сброс (рестарт) игры
  const justResetGameRef = useRef(false);

  // Сброс по изменению user/playerData
  React.useEffect(() => {
    setInitialGameState(makeInitialGameState());
    setGameSessionId(Date.now());
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setIsPaused(false);

    // В момент сброса выставляем флаг "только что сбросили"
    justResetGameRef.current = true;
    console.debug('[MolaMolaGame] Game RESET triggered by playerData:', playerData);

    // Для надёжности сбрасываем HUD тоже
    setHud(makeInitialGameState());
  }, [playerData, setInitialGameState, setGameSessionId, setGameEnded, setVictory, setFinalStats, setIsPaused, setHud]);

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

  // --- Защищаем HUD от скачков и неконсистентного состояния ---
  const onStateUpdate = (updates: any) => {
    setHud((prev: any) => {
      const safeUpdates = updates ?? {};
      let changed = false;
      let nextHud = { ...prev };

      // --- HEALTH
      if (
        typeof safeUpdates.health === "number" &&
        isFinite(safeUpdates.health) &&
        safeUpdates.health !== prev.health &&
        safeUpdates.health >= 0 &&
        safeUpdates.health <= 100
      ) {
        nextHud.health = safeUpdates.health;
        changed = true;
      }

      // --- AMMO
      if (
        typeof safeUpdates.ammo === "number" &&
        isFinite(safeUpdates.ammo) &&
        safeUpdates.ammo !== prev.ammo &&
        safeUpdates.ammo >= 0 &&
        safeUpdates.ammo <= 999
      ) {
        nextHud.ammo = safeUpdates.ammo;
        changed = true;
      }

      // --- COINS
      if (
        typeof safeUpdates.coins === "number" &&
        isFinite(safeUpdates.coins) &&
        safeUpdates.coins !== prev.coins
      ) {
        // clamp coins: 0..1000
        const coinsVal = Math.max(0, Math.min(1000, safeUpdates.coins));
        if (coinsVal !== prev.coins) {
          nextHud.coins = coinsVal;
          changed = true;
        }
      }

      // --- LEVEL: НЕ допускаем уменьшения уровня кроме рестарта
      const levelValid =
        typeof safeUpdates.level === "number" &&
        isFinite(safeUpdates.level) &&
        safeUpdates.level > 0 &&
        safeUpdates.level < 1000; // защита от аномалий

      if (levelValid) {
        const resetOrLevelIncreased =
          justResetGameRef.current || safeUpdates.level >= prev.level;

        if (
          safeUpdates.level !== prev.level &&
          resetOrLevelIncreased
        ) {
          nextHud.level = safeUpdates.level;
          changed = true;
        }
      }

      // После успешного обновления HUD сбрасываем флаг сброса игры
      if (justResetGameRef.current) {
        justResetGameRef.current = false;
      }

      // Не обновляем HUD если ничего реально не поменялось
      if (!changed || isEqualHud(nextHud, prev)) {
        return prev;
      }

      // Логирование каждой смены HUD для отладки всех странных скачков!
      console.info("[HUD update] from", prev, "to", nextHud);

      return nextHud;
    });
  };

  // --- STOP: fixation for correct HUD "stabilization" ---
  const handleGameEnd = (isVictory: boolean, stats: any) => {
    setGameEnded(true);
    setVictory(isVictory);
    setFinalStats(stats); // теперь просто { level, coins }
    setIsPaused(false);
    setGameSessionId(Date.now());
    // HUD на End гарантируем что он совпадает со stats
    setHud((h: any) => ({
      ...h,
      level: stats?.level ?? h.level,
      coins: stats?.coins ?? h.coins,
    }));
    console.log("[GameEnd] Triggered: victory=", isVictory, "stats=", stats, "gameSessionId=", gameSessionId);
  };

  // --- Полный сброс состояния и HUD для корректной работы рестарта ---
  const handleRestart = () => {
    resetGame();
    justResetGameRef.current = true;
    // Сброс HUD на начальное значение гарантированно
    setHud(makeInitialGameState());
    // Доп.логирование для отладки
    console.log("[handleRestart] Reset game state through hook & HUD");
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
