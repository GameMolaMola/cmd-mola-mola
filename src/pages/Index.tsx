
import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';
import { GameProvider } from '@/contexts/GameContext';

const Index = () => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/game');
  };

  return (
    <GameProvider>
      <LandingPage onPlay={handlePlay} />
    </GameProvider>
  );
};

export default Index;
