
import React, { useState } from 'react';
import GameCanvas from './GameCanvas';
import StartScreen from './StartScreen';
import GameUI from './GameUI';
import GameOverScreen from './GameOverScreen';

export interface GameState {
  screen: 'start' | 'playing' | 'gameOver';
  level: number;
  score: number;
  health: number;
  ammo: number;
  coins: number;
  isVictory: boolean;
}

const MolaMolaGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'start',
    level: 1,
    score: 0,
    health: 100,
    ammo: 20,
    coins: 0,
    isVictory: false
  });

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

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative bg-black border-4 border-yellow-400 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20">
        <div className="w-full h-[450px] relative">
          {gameState.screen === 'start' && (
            <StartScreen onStart={startGame} />
          )}
          
          {gameState.screen === 'playing' && (
            <>
              <GameCanvas 
                gameState={gameState}
                onGameEnd={endGame}
                onStateUpdate={updateGameState}
              />
              <GameUI gameState={gameState} />
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
