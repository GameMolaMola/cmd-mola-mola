
import React from 'react';
import { GameState } from './MolaMolaGame';

interface GameUIProps {
  gameState: GameState;
}

const GameUI = ({ gameState }: GameUIProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white font-mono z-10">
      <div className="bg-black/70 p-3 rounded-lg border border-cyan-400">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❤️</span>
            <span>Здоровье: {gameState.health}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🚀</span>
            <span>Патроны: {gameState.ammo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🪙</span>
            <span>Монеты: {gameState.coins}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">🎯</span>
            <span>Уровень: {gameState.level}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-black/70 p-3 rounded-lg border border-yellow-400">
        <div className="text-sm">
          <div className="text-yellow-400 mb-1">Счет: {gameState.score}</div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
