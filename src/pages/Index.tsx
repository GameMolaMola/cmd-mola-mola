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
        {/* Убраны кнопки быстрого перехода к гайдам мобильной публикации */}
        <LandingPage onPlay={handlePlay} />
      </div>
    </GameProvider>
  );
};

export default Index;
