
import React from 'react';
import { GameState } from './MolaMolaGame';

interface GameUIProps {
  gameState: GameState;
}

const GameUI = ({ gameState }: GameUIProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start font-mono text-white z-10">
      <div className="bg-black/70 p-3 rounded-lg border border-cyan-400">
        <div className="space-y-1">
          <div className="text-yellow-400">Уровень: {gameState.level}</div>
          <div className="text-cyan-400">Монеты: {gameState.coins}</div>
          <div className="text-green-400">Патроны: {gameState.ammo}</div>
        </div>
      </div>
      
      <div className="bg-black/70 p-3 rounded-lg border border-red-400">
        <div className="text-red-400 mb-1">Здоровье</div>
        <div className="w-32 h-4 bg-gray-700 border border-gray-500 rounded">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded transition-all duration-300"
            style={{ width: `${gameState.health}%` }}
          />
        </div>
        <div className="text-xs text-center mt-1">{gameState.health}/100</div>
      </div>
    </div>
  );
};

export default GameUI;
