
import { useState } from "react";
import { makeInitialGameState } from "./makeInitialGameState";
import type { GameState } from "./types";

export function useGameReset(playerData: any) {
  const [hud, setHud] = useState(() => makeInitialGameState());
  const [initialGameState, setInitialGameState] = useState<GameState>(() => makeInitialGameState());
  const [gameSessionId, setGameSessionId] = useState<number>(() => Date.now());
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const resetGame = () => {
    const initial = makeInitialGameState();
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
