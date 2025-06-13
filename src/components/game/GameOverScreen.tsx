
import React from 'react';
import { Button } from '@/components/ui/button';
import { GameState } from './MolaMolaGame';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

const GameOverScreen = ({ gameState, onRestart }: GameOverScreenProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-purple-800 flex flex-col items-center justify-center text-white font-mono">
      <div className="text-center space-y-6 p-8">
        <h1 className={`text-5xl font-bold mb-8 ${
          gameState.isVictory ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {gameState.isVictory ? '🏆 VITTORIA! 🏆' : '💀 GAME OVER 💀'}
        </h1>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-cyan-400">
          <h2 className="text-xl text-cyan-400 mb-4">РЕЗУЛЬТАТЫ:</h2>
          <div className="space-y-2">
            <p>Уровень: {gameState.level}</p>
            <p>Монеты Mola Mola: {gameState.coins}</p>
            <p>Финальный счет: {gameState.score}</p>
          </div>
        </div>
        
        {gameState.isVictory && (
          <div className="text-yellow-300 text-lg animate-pulse">
            Ты завоевал все моря Калабрии! 🌊
          </div>
        )}
        
        <Button 
          onClick={onRestart}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8 py-4 text-lg"
        >
          НОВОЕ ПРИКЛЮЧЕНИЕ
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
