
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

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

// Хелпер для создания стартового состояния игры
function makeInitialGameState() {
  return {
    health: 100,
    ammo: 10,
    coins: 0,
    level: 1,
    powerUps: {
      speedBoost: false,
      speedBoostTime: 0,
    },
    score: 110,
    isVictory: false,
  };
}

const MolaMolaGame = ({ autoStart = false }: { autoStart?: boolean }) => {
  // Состояния для HUD
  const [hud, setHud] = useState({ health: 100, ammo: 10, coins: 0, level: 1, score: 110 });
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Ключ игрового сеанса, меняется при каждом рестарте и GameOver
  const [gameSessionId, setGameSessionId] = useState<number>(() => Date.now());

  const { playerData } = useGame();
  const freeBrasilena = useFreeBrasilena();

  // Получаем username
  const username =
    typeof playerData?.nickname === "string"
      ? playerData.nickname
      : typeof playerData?.email === "string"
      ? playerData.email
      : undefined;

  const showMobileControls = isMobileDevice() || isTelegramBrowser();

  const [initialGameState, setInitialGameState] = useState<GameState>(() =>
    makeInitialGameState()
  );

  // --- Обновляем начальное состояние при смене playerData
  useEffect(() => {
    setInitialGameState(makeInitialGameState());
    setGameSessionId(Date.now());
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

  // HUD State Update
  const onStateUpdate = (updates: any) => {
    setHud((prev) => {
      let score = updates.score ?? (updates.coins ?? prev.coins) * 10 + (updates.level ?? prev.level) * 100;
      return { ...prev, ...updates, score };
    });
  };

  // Как только закончилась игра — обновляем gameSessionId чтобы GameCanvas пересоздался при рестарте
  const handleGameEnd = (isVictory: boolean, stats: any) => {
    setGameEnded(true);
    setVictory(isVictory);
    setFinalStats(stats);
    setGameSessionId(Date.now()); // гарантированный update
  };

  // Исправлено: при рестарте используем новое состояние и новый ключ
  const handleRestart = () => {
    const newState = makeInitialGameState();
    setHud({ health: 100, ammo: 10, coins: 0, level: 1, score: 110 });
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setInitialGameState(newState);
    setGameSessionId(Date.now());
    // GameCanvas гарантированно пересоздаётся из-за key!
  };

  const handleControl = (control: string, state: boolean) => {
    // Здесь можно добавить логику обработки мобильных контролов
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start">
      <GameHUD
        health={hud.health}
        ammo={hud.ammo}
        coins={hud.coins}
        level={hud.level}
        score={hud.score}
        onPause={onPause}
        isMobile={showMobileControls}
      />
      <GameCanvas
        key={gameSessionId}
        gameState={initialGameState}
        onGameEnd={handleGameEnd}
        onStateUpdate={onStateUpdate}
        onMobileControl={handleControl}
        isMobile={showMobileControls}
        username={username}
        isPaused={isPaused}
        gameSessionId={gameSessionId}
      />
      {showMobileControls && (
        <MobileControls onControl={handleControl} />
      )}
      <PauseOverlay visible={isPaused} />
      <GameOverDialog
        open={gameEnded}
        victory={victory}
        stats={{
          level: hud.level,
          coins: hud.coins,
          score: hud.score
        }}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default MolaMolaGame;
