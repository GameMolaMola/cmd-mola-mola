import React from 'react';
import { GameState } from './types';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';

interface GameUIProps {
  gameState: GameState;
}

const GameUI = ({ gameState }: GameUIProps) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white font-mono z-10">
      <div className="bg-black/70 p-3 rounded-lg border border-cyan-400">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❤️</span>
            <span>{t.healthText}: {gameState.health}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🚀</span>
            <span>{t.ammoText}: {gameState.ammo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🪙</span>
            <span>{t.coinsText}: {gameState.coins}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">🎯</span>
            <span>{t.levelText}: {gameState.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
