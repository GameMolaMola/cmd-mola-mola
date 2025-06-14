import React from 'react';
import LandingPage from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';
import { GameProvider } from '@/contexts/GameContext';
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/game?autostart=1');
  };

  return (
    <GameProvider>
      <div className="flex flex-col space-y-3 w-full max-w-xl mx-auto">
        {/* Кнопки быстрого перехода к гайдам мобильной публикации */}
        <div className="w-full flex flex-row justify-center gap-2 mb-2">
          <Button className="bg-yellow-700 hover:bg-yellow-800 text-white font-medium" onClick={() => navigate('/appstore')}>
            Гайд: Публикация в App Store
          </Button>
          <Button className="bg-green-700 hover:bg-green-800 text-white font-medium" onClick={() => navigate('/android')}>
            Гайд: Публикация в Google Play
          </Button>
        </div>
        <LandingPage onPlay={handlePlay} />
      </div>
    </GameProvider>
  );
};

export default Index;
