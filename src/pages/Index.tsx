
import React from 'react';
import LandingPage from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';
import { GameProvider } from '@/contexts/GameContext';
// Не импортируем Button больше здесь
import MobileGuidesNav from "@/components/MobileGuidesNav";

const Index = () => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/game?autostart=1');
  };

  return (
    <GameProvider>
      <div className="flex flex-col space-y-3 w-full max-w-xl mx-auto">
        {/* Для показа кнопок мобильных гайдов раскомментируйте строку ниже */}
        {/* <MobileGuidesNav /> */}
        <LandingPage onPlay={handlePlay} />
      </div>
    </GameProvider>
  );
};

export default Index;
