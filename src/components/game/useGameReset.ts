
import { useState } from "react";
import { makeInitialGameState } from "./makeInitialGameState";
import type { GameState } from "./types";

export function useGameReset(playerData: any) {
  // Если в playerData есть уровень или godmode, используем их для initialState
  const startLevel = playerData?.level ?? 1;
  const godmode = playerData?.godmode ?? false;
  const markJump = playerData?.markJump ?? false;

  const [hud, setHud] = useState(() => makeInitialGameState(startLevel, godmode, markJump));
  const [initialGameState, setInitialGameState] = useState<GameState>(() => makeInitialGameState(startLevel, godmode, markJump));
  const [gameSessionId, setGameSessionId] = useState<number>(() => Date.now());
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const resetGame = () => {
    // При сбросе берём level и godmode из playerData, если есть
    const levelToStart = playerData?.level ?? 1;
    const godmodeHere = playerData?.godmode ?? false;
    const markJumpHere = playerData?.markJump ?? false;
    const initial = makeInitialGameState(levelToStart, godmodeHere, markJumpHere);
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
