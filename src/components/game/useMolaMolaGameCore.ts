import React from "react";
import { useRef, useEffect } from "react";
import { makeInitialGameState } from "./makeInitialGameState";
import { useGameReset } from "./useGameReset";
import { loadGameSettings, saveGameSettings } from "./gameSettingsManager";
import { isEqualHud, onStateUpdateFactory, handleGameEndFactory } from "./molaMolaHudUtils";

/**
 * Хук, который инкапсулирует основную бизнес-логику "ядра" MolaMolaGame.
 * Абсолютно точно повторяет прежнее поведение.
 */
export function useMolaMolaGameCore({
  playerData,
  freeBrasilena,
  username
}: {
  playerData: any;
  freeBrasilena: any;
  username: string | undefined;
}) {
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

  // Debug: логируем параметры после инициализации хуков
  React.useEffect(() => {
    console.log("[useMolaMolaGameCore] INIT/RESET", {
      playerData,
      username,
      hud,
      initialGameState,
    });
  }, [hud, initialGameState, playerData, username]);

  // Показываем мобильные контролы (оставляем юзерский хук)
  // В компоненте!

  // Флаг только-что сбросили
  const justResetGameRef = useRef(false);

  // Хэндлер pause
  const onPause = () => {
    if (!gameEnded) setIsPaused((p: boolean) => !p);
  };

  // side-effect сброса при смене playerData
  React.useEffect(() => {
    const startLevel = playerData?.level ?? 1;
    const godmode = playerData?.godmode ?? false;
    const markJump = playerData?.markJump ?? false;
    
    // ВАЖНО: передаем username в initialState!
    const newInitialState = makeInitialGameState(startLevel, godmode, markJump);
    newInitialState.username = username;
    
    setInitialGameState(newInitialState);
    setGameSessionId(Date.now());
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    setIsPaused(false);
    justResetGameRef.current = true;
    
    const newHudState = makeInitialGameState(startLevel, godmode, markJump);
    newHudState.username = username;
    setHud(newHudState);
  }, [playerData, username, setInitialGameState, setGameSessionId, setGameEnded, setVictory, setFinalStats, setIsPaused, setHud]);

  // сброс isPaused если конец игры
  useEffect(() => {
    if (!gameEnded) setIsPaused(false);
  }, [gameEnded, setIsPaused]);

  // Клавиша паузы
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyP" && !gameEnded) {
        setIsPaused((v: boolean) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameEnded, setIsPaused]);

  // HUD и GameOver обработчики (создаём фабрики чтобы иметь доступ к рефам/состояниям)
  const onStateUpdate = onStateUpdateFactory({ setHud, justResetGameRef });
  const handleGameEnd = handleGameEndFactory({
    setGameEnded, setVictory, setFinalStats, setIsPaused, setGameSessionId, setHud,
    gameSessionId,
  });

  // Загрузка настроек из локального хранилища
  useEffect(() => {
    const persistent = loadGameSettings();
    if (persistent.maxLevel > 1) {
      setHud((h: any) => ({ ...h, level: persistent.maxLevel }));
      setInitialGameState((gs: any) => ({ ...gs, level: persistent.maxLevel }));
    }
  }, [setHud, setInitialGameState]);

  // Сохраняем прогресс
  useEffect(() => {
    saveGameSettings({
      totalCoins: hud.coins,
      maxLevel: hud.level
    });
  }, [hud.coins, hud.level]);

  // Полный сброс (рестарт)
  const lastGameEngine = useRef<any>(null);
  const handleRestart = () => {
    if (lastGameEngine.current) {
      try {
        lastGameEngine.current.stop();
      } catch {
        // ignore errors stopping the engine
      }
      lastGameEngine.current = null;
    }
    resetGame();
    justResetGameRef.current = true;
    // Прокидываем правильные опции
    const startLevel = playerData?.level ?? 1;
    const godmode = playerData?.godmode ?? false;
    const markJump = playerData?.markJump ?? false;
    const newState = makeInitialGameState(startLevel, godmode, markJump);
    newState.username = username;
    setHud(newState);
    setInitialGameState(newState);
    setGameSessionId(Date.now());
  };

  // Коллектор движка
  const collectEngineRef = (engineInstance: any) => {
    lastGameEngine.current = engineInstance;
  };

  // --- Исправленный Mobile-Хэндлер (запуск стрельбы и звука НАДЕЖНО!) ---
  const handleControl = (control: string, state: boolean) => {
    if (!lastGameEngine.current || gameEnded) return;
    if (typeof lastGameEngine.current.setMobileControlState === "function") {
      lastGameEngine.current.setMobileControlState(control, state);
    }
    // Добавляем проксирующую команду для "Огонь"
    if (control === "fire" && state === true) {
      // Всегда пробуем активировать аудио — даже если уже активировано, безопасно
      import('./audioManager').then(mod => { mod.activateAudio?.(); });
      if (typeof lastGameEngine.current.fire === "function") {
        lastGameEngine.current.fire();
      }
    }
    // Для любого ввода, который должен запускать звук — jump/fire
    if ((control === "jump" || control === "fire") && state === true) {
      import('./audioManager').then(mod => { mod.activateAudio?.(); });
    }
  };

  return {
    hud, setHud,
    initialGameState, setInitialGameState,
    gameSessionId, setGameSessionId,
    gameEnded, setGameEnded,
    victory, setVictory,
    finalStats, setFinalStats,
    isPaused, setIsPaused,
    resetGame,
    onPause,
    onStateUpdate,
    handleGameEnd,
    handleRestart,
    collectEngineRef,
    handleControl
  };
}
