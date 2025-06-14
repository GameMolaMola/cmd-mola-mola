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

  const { playerData } = useGame();
  const freeBrasilena = useFreeBrasilena();

  // Получаем username: стараемся брать nickname, либо email, иначе undefined
  const username =
    typeof playerData?.nickname === "string"
      ? playerData.nickname
      : typeof playerData?.email === "string"
      ? playerData.email
      : undefined;

  // Детектируем, показывать ли mobile controls (мобила ИЛИ Telegram браузер)
  const showMobileControls = isMobileDevice() || isTelegramBrowser();

  // Сохраняем начальный gameState (чтоб не пересоздавался на каждый рендер)
  const [initialGameState, setInitialGameState] = useState<GameState>(() =>
    makeInitialGameState() // нативный state, без username
  );

  // Обновляем начальное состояние при смене playerData (например, новый игрок)
  useEffect(() => {
    setInitialGameState(makeInitialGameState());
  }, [playerData]);

  // --- Pause logic
  // Клавиши: P для паузы (только когда не GameOver)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyP" && !gameEnded) {
        setIsPaused((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameEnded]);

  // Если ушли с паузы, отменим pause overlay если надо после рестарта
  useEffect(() => {
    if (!gameEnded) setIsPaused(false);
  }, [gameEnded]);

  const onPause = () => {
    if (!gameEnded) setIsPaused((p) => !p);
  };

  // --- KEY: Добавим score при обновлении!
  const onStateUpdate = (updates: any) => {
    setHud((prev) => {
      // score гарантированно обновляется, даже если не пришел из движка
      let score = updates.score ?? (updates.coins ?? prev.coins) * 10 + (updates.level ?? prev.level) * 100;
      return { ...prev, ...updates, score };
    });
  };

  // Исправлено: при рестарте используем новое состояние
  const handleRestart = () => {
    const newState = makeInitialGameState();
    setHud({ health: 100, ammo: 10, coins: 0, level: 1, score: 110 });
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setInitialGameState(newState);
    // После обновления initialGameState компонент GameCanvas пересоздастся
  };

  const handleControl = (control: string, state: boolean) => {
    // Здесь можно добавить дополнительную логику обработки мобильных контролов
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
        key={JSON.stringify(initialGameState) + username}
        gameState={initialGameState}
        onGameEnd={(victory, finalStats) => {
          setGameEnded(true);
          setVictory(victory);
          setFinalStats(finalStats);
        }}
        onStateUpdate={onStateUpdate}
        onMobileControl={handleControl}
        isMobile={showMobileControls}
        username={username}
        isPaused={isPaused}
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
          score: hud.score // score теперь всегда точно есть!
        }}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default MolaMolaGame;
