
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-blue-900 flex flex-col items-center justify-center text-white font-mono">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 animate-pulse">
          {t.title}
        </h1>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-cyan-400">
          <h2 className="text-xl text-cyan-400 mb-4">{t.controlsHeader}</h2>
          <div className="space-y-2 text-sm">
            <p>{t.jump}</p>
            <p>{t.move}</p>
            <p>{t.fire}</p>
          </div>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl text-yellow-400 mb-4">{t.collectHeader}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>🪙 {t.coins}</div>
            <div>{t.pizza}</div>
            <div>{t.brasilena}</div>
            <div>{t.wine}</div>
          </div>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-red-400">
          <h2 className="text-xl text-red-400 mb-4">{t.effectsHeader}</h2>
          <div className="space-y-2 text-sm">
            <p>{t.pizzaEffect}</p>
            <p>{t.brasilenaEffect}</p>
            <p>{t.wineEffect}</p>
          </div>
        </div>
        
        <Button 
          onClick={onStart}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg animate-bounce"
        >
          {t.startButton}
        </Button>
        
        <div className="text-xs text-cyan-300">
          {t.subtitle}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
