
import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import StartScreen from './StartScreen';
import GameUI from './GameUI';
import GameOverScreen from './GameOverScreen';
import MobileControls from "./MobileControls";

export interface GameState {
  screen: 'start' | 'playing' | 'gameOver';
  level: number;
  score: number;
  health: number;
  ammo: number;
  coins: number;
  isVictory: boolean;
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

// Получаем реальную высоту и ширину для мобильного блока (для адаптации после смены ориентации)
const getMobileContainerSize = () => {
  const width = window.innerWidth;
  const height = Math.max(
    window.innerHeight,
    document.documentElement.clientHeight || 0,
    window.screen.height || 0
  );
  return { width, height };
};

const MolaMolaGame = ({ autoStart }: { autoStart?: boolean }) => {
  const [gameState, setGameState] = useState<GameState>({
    screen: autoStart ? 'playing' : 'start',
    level: 1,
    score: 0,
    health: 100,
    ammo: 20,
    coins: 0,
    isVictory: false
  });
  const [mobileContainerSize, setMobileContainerSize] = useState<{width: number, height: number}>({width: 0, height: 0});
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Следим за изменением размеров для мобильных
  useEffect(() => {
    if (!isMobile) return;
    const update = () => setMobileContainerSize(getMobileContainerSize());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [isMobile]);

  useEffect(() => {
    if (autoStart && gameState.screen === 'start') {
      setGameState({
        screen: 'playing',
        level: 1,
        score: 0,
        health: 100,
        ammo: 20,
        coins: 0,
        isVictory: false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const startGame = () => {
    setGameState({
      screen: 'playing',
      level: 1,
      score: 0,
      health: 100,
      ammo: 20,
      coins: 0,
      isVictory: false
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

  // Styles for mobile container (ensure real full-screen cover, even after orientation changes)
  const mobileContainerStyles = isMobile 
    ? {
        minHeight: mobileContainerSize.height || '100dvh',
        height: mobileContainerSize.height || '100dvh',
        minWidth: mobileContainerSize.width || '100vw',
        width: mobileContainerSize.width || '100vw',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        background: 'linear-gradient(to bottom, #2563eb, #1e3a8a)',
        zIndex: 0,
        overflow: 'hidden',
      }
    : { minHeight: 450, height: 450 };

  return (
    <div
      className={`relative w-full h-full ${isMobile ? "fixed inset-0 left-0 top-0" : "max-w-4xl"} mx-auto`}
      style={mobileContainerStyles}
    >
      <div
        className="relative w-full h-full bg-black border-4 border-yellow-400 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20"
        style={
          isMobile
            ? {
                width: '100vw',
                height: mobileContainerSize.height || '100dvh',
                borderRadius: 0,
                maxWidth: '100vw',
                maxHeight: '100dvh',
                margin: 0,
                left: 0,
                top: 0,
              }
            : {}
        }
      >
        <div
          className="w-full h-full"
          style={isMobile ? { height: mobileContainerSize.height || '100dvh' } : { height: 450 }}
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
                width: '100vw',
                height: mobileContainerSize.height || '100dvh',
                minHeight: mobileContainerSize.height || '100dvh',
                minWidth: mobileContainerSize.width || '100vw',
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

