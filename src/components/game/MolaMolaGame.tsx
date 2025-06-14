import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import StartScreen from './StartScreen';
import GameUI from './GameUI';
import GameOverScreen from './GameOverScreen';
import MobileControls from "./MobileControls";
import { useGame } from '@/contexts/GameContext';

// Универсальная функция для чтения полной видимой области — теперь и для webkit-браузеров
const getVisibleViewport = () => {
  let w = window.innerWidth;
  let h = Math.max(
    window.innerHeight,
    document.documentElement.clientHeight || 0,
    window.screen.height || 0
  );
  return { width: w, height: h };
};

export interface GameState {
  screen: 'start' | 'playing' | 'gameOver';
  level: number;
  score: number;
  health: number;
  ammo: number;
  coins: number;
  isVictory: boolean;
  godmode: boolean;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900 || window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);
  return isMobile;
}

const MolaMolaGame = ({ autoStart }: { autoStart?: boolean }) => {
  const [gameState, setGameState] = useState<GameState>({
    screen: autoStart ? 'playing' : 'start',
    level: 1,
    score: 0,
    health: 100,
    ammo: 20,
    coins: 0,
    isVictory: false,
    godmode: false,
  });
  // Храним актуальный viewport
  const [viewport, setViewport] = useState<{width: number, height: number}>({width: 0, height: 0});
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Следим за изменением размеров
  useEffect(() => {
    const update = () => setViewport(getVisibleViewport());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  useEffect(() => {
    if (autoStart && gameState.screen === 'start') {
      setGameState({
        screen: 'playing',
        level: 1,
        score: 0,
        health: 100,
        ammo: 20,
        coins: 0,
        isVictory: false,
        godmode: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const { playerData } = useGame();

  // Вспомогательное определение godmode
  const isGodmode = playerData && playerData.nickname === '@MolaMolaCoin';

  const startGame = () => {
    setGameState({
      screen: 'playing',
      level: 1,
      score: 0,
      health: 100,
      ammo: 20,
      coins: 0,
      isVictory: false,
      godmode: isGodmode,
    });
  };

  const restartGame = () => {
    startGame();
  };

  const endGame = (victory: boolean, finalStats: Partial<GameState>) => {
    setGameState(prev => ({
      ...prev,
      ...finalStats,
      screen: 'gameOver',
      isVictory: victory
    }));
  };

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const handleMobileControl = (control: string, state: boolean) => {};

  // Стили для контейнера — обеспечиваем, что он всегда по центру и без полос
  const containerStyles = isMobile
    ? {
        position: 'fixed' as const,
        left: 0,
        top: 0,
        width: viewport.width || '100vw',
        height: viewport.height || '100dvh',
        minWidth: viewport.width || '100vw',
        minHeight: viewport.height || '100dvh',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        background: 'linear-gradient(to bottom, #2563eb, #1e3a8a)',
        overflow: 'hidden',
        zIndex: 0,
        padding: 0,
        margin: 0,
      }
    : {
        minHeight: 450,
        height: 450,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };

  return (
    <div
      className={`relative w-full h-full ${isMobile ? "" : "max-w-4xl mx-auto"}`}
      style={containerStyles}
    >
      <div
        className="relative w-full h-full bg-black border-4 border-yellow-400 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20"
        style={
          isMobile
            ? {
                width: viewport.width || '100vw',
                height: viewport.height || '100dvh',
                borderRadius: 0,
                maxWidth: '100vw',
                maxHeight: '100dvh',
                left: 0,
                top: 0,
                margin: 0,
              }
            : {}
        }
      >
        <div
          className="w-full h-full"
          style={isMobile ? { height: viewport.height || '100dvh' } : { height: 450 }}
        >
          {gameState.screen === 'start' && (
            <StartScreen onStart={startGame} />
          )}
          {gameState.screen === 'playing' && (
            <>
              <GameCanvas
                ref={canvasRef}
                gameState={gameState}
                onGameEnd={endGame}
                onStateUpdate={updateGameState}
                onMobileControl={handleMobileControl}
                isMobile={isMobile}
                // добавляем godmode явно, если GameCanvas это позволяет
                // иначе GameEngine заберёт его из initialState внутри gameState
              />
              <GameUI gameState={gameState} />
              {isMobile && (
                <MobileControls
                  onControl={(
                    control,
                    state
                  ) =>
                    canvasRef.current &&
                    ((window as any).__molaMobileHandle?.(control, state))
                  }
                />
              )}
            </>
          )}
          {gameState.screen === 'gameOver' && (
            <div
              className="fixed inset-0 z-40"
              style={{
                width: viewport.width || '100vw',
                height: viewport.height || '100dvh',
                minHeight: viewport.height || '100dvh',
                minWidth: viewport.width || '100vw',
                left: 0,
                top: 0,
                background: 'linear-gradient(to bottom, #0a2147, #000000)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GameOverScreen
                gameState={gameState}
                onRestart={restartGame}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MolaMolaGame;
