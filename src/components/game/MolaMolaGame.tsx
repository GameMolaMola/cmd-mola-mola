
import React, { useRef, useEffect, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import GameHUD from "./hud/GameHUD";
import GameOverDialog from "./hud/GameOverDialog";
import { useFreeBrasilena } from "./useFreeBrasilena";
import MobileControls from "./MobileControls";
import GameCanvas from "./GameCanvas";
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
    score: 0,
    isVictory: false,
  };
}

const MolaMolaGame = ({ autoStart = false }: { autoStart?: boolean }) => {
  // Состояния для HUD
  const [hud, setHud] = useState({ health: 100, ammo: 10, coins: 0, level: 1 });
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);

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

  // Callback из движка/canvas
  const onStateUpdate = (updates: any) => {
    setHud((prev) => ({ ...prev, ...updates }));
  };

  // Исправлено: при рестарте используем новое состояние
  const handleRestart = () => {
    const newState = makeInitialGameState();
    setHud({ health: 100, ammo: 10, coins: 0, level: 1 });
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
      />
      {showMobileControls && (
        <MobileControls onControl={handleControl} />
      )}
      <GameOverDialog
        open={gameEnded}
        victory={victory}
        stats={{
          level: hud.level,
          coins: hud.coins,
          score: hud.coins * 10 + (hud.level * 100),
        }}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default MolaMolaGame;
