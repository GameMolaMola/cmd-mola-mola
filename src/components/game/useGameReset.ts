
import { useState } from "react";
import { makeInitialGameState } from "./makeInitialGameState";
import type { GameState } from "./types";

export function useGameReset(playerData: any) {
  // Корректно определяем стартовый уровень и godmode
  // Учитываем, что playerData может содержать все нужные поля
  const startLevel = playerData?.level !== undefined ? playerData.level : 1;
  const godmode = !!playerData?.godmode;
  const markJump = !!playerData?.markJump;

  // Debug log для отслеживания инициализации
  console.log("[useGameReset] INIT:", { startLevel, godmode, markJump, playerData });

  const [hud, setHud] = useState(() => makeInitialGameState(startLevel, godmode, markJump));
  const [initialGameState, setInitialGameState] = useState<GameState>(() => makeInitialGameState(startLevel, godmode, markJump));
  const [gameSessionId, setGameSessionId] = useState<number>(() => Date.now());
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const resetGame = () => {
    // Перепределяем стартовые данные точно по playerData
    const levelToStart = playerData?.level !== undefined ? playerData.level : 1;
    const godmodeHere = !!playerData?.godmode;
    const markJumpHere = !!playerData?.markJump;
    const initial = makeInitialGameState(levelToStart, godmodeHere, markJumpHere);

    // Debug log
    console.log("[useGameReset] RESET:", { levelToStart, godmodeHere, markJumpHere, playerData });

    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setIsPaused(false);
    setHud({ ...initial });
    setInitialGameState(initial);
    setGameSessionId(Date.now());
  };

  return {
    hud,
    setHud,
    initialGameState,
    setInitialGameState,
    gameSessionId,
    setGameSessionId,
    gameEnded,
    setGameEnded,
    victory,
    setVictory,
    finalStats,
    setFinalStats,
    isPaused,
    setIsPaused,
    resetGame,
  };
}
