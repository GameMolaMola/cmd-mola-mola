
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
import LevelIndicator from "./hud/LevelIndicator";

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

  const showMobileControls = isMobileDevice() || isTelegramBrowser();

  const [initialGameState, setInitialGameState] = useState<GameState>(() =>
    makeInitialGameState()
  );

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

  const handleGameEnd = (isVictory: boolean, stats: any) => {
    setGameEnded(true);
    setVictory(isVictory);
    setFinalStats(stats);
    setGameSessionId(Date.now());
  };

  const handleRestart = () => {
    const newState = makeInitialGameState();
    setHud({ health: 100, ammo: 10, coins: 0, level: 1, score: 110 });
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setInitialGameState(newState);
    setGameSessionId(Date.now());
  };

  // --- привязываем мобильные контролы к движению ---
  const lastGameEngine = useRef<any>(null);

  // Получаем ссылку на GameEngine от GameCanvas через ref
  const collectEngineRef = (engineInstance: any) => {
    lastGameEngine.current = engineInstance;
  };

  // Реализация: дергаем GameEngine.setMobileControlState для управления
  const handleControl = (control: string, state: boolean) => {
    if (lastGameEngine.current && typeof lastGameEngine.current.setMobileControlState === "function") {
      lastGameEngine.current.setMobileControlState(control, state);
    }
  };

  // Переработка структуры разметки: canvas и mobile controls теперь НЕ overlap, а идут друг за другом
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start overflow-hidden"
         style={{minHeight: showMobileControls ? '100svh' : '100%'}}>
      {/* HUD и LevelIndicator фиксированы, они поверх canvas */}
      <GameHUD
        health={hud.health}
        ammo={hud.ammo}
        coins={hud.coins}
        level={hud.level}
        score={hud.score}
        onPause={onPause}
        isMobile={showMobileControls}
        language={language}
      />
      <LevelIndicator level={hud.level} language={language} />
      {/* Блок для canvas - min-h должен учитывать высоту кнопок управления */}
      <div className="relative w-full flex flex-col items-center justify-center"
           style={{
             maxWidth: 900, width: '100%',
             margin: '0 auto'
           }}>
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
          collectEngineRef={collectEngineRef}
        />
      </div>
      {/* Теперь MobileControls вынесены под canvas */}
      {showMobileControls && (
        <div className="w-full z-30 bottom-0 left-0 sticky"
              style={{
                maxWidth: 900,
                margin: "0 auto",
              }}>
          <MobileControls onControl={handleControl} />
        </div>
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

