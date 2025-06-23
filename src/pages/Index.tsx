
import React from 'react';
import LandingPage from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';
// GameProvider is now applied globally in App.tsx
// Не импортируем Button больше здесь
import MobileGuidesNav from "@/components/MobileGuidesNav";

const Index = () => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/game?autostart=1');
  };

  return (
    <div className="flex flex-col space-y-3 w-full max-w-xl mx-auto">
      {/* Для показа кнопок мобильных гайдов раскомментируйте строку ниже */}
      {/* <MobileGuidesNav /> */}
      <LandingPage onPlay={handlePlay} />
    </div>
  );
};

export default Index;
