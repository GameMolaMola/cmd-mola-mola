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
    const check = () => setIsMobile(window.innerWidth < 800 || window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
    isVictory: false
  });
  const [mobileControl, setMobileControl] = useState<{control: string; state: boolean}>();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Отлично: onMobileControl нужен только для внешней логики, в сам рисунок теперь событие отправляется кусочком выше

  // Передаём handleMobileControl без изменений, для совместимости
  const handleMobileControl = (control: string, state: boolean) => {
    // Возможно тут какая-то внешняя аналитика, пусть останется вызовом пустышки
  };

  return (
    <div className={`relative w-full ${isMobile ? "" : "max-w-4xl"} mx-auto`}>
      <div className="relative bg-black border-4 border-yellow-400 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20">
        <div className="w-full" style={isMobile ? {height: 'calc(100vh - 60px)'} : {height: 450}}>
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
                <MobileControls onControl={(
                    control,
                    state
                  ) =>
                    // Вызывается на каждом таче — напрямую пробрасываем в канвас (и дальше в GameEngine)
                    (canvasRef.current &&
                      ((window as any).__molaMobileHandle?.(control, state)))
                  }
                />
              )}
            </>
          )}
          {gameState.screen === 'gameOver' && (
            <GameOverScreen 
              gameState={gameState}
              onRestart={restartGame}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MolaMolaGame;
