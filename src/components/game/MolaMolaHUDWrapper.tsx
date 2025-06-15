
import React, { useState, useEffect } from 'react';
import GameHUD from './hud/GameHUD';
import { GameState } from './types';
import { audioManager } from './audioManager';

interface MolaMolaHUDWrapperProps {
  gameState: GameState;
  isMobile: boolean;
  onPause: () => void;
}

const MolaMolaHUDWrapper: React.FC<MolaMolaHUDWrapperProps> = ({ gameState, isMobile, onPause }) => {
  const [soundMuted, setSoundMuted] = useState(audioManager.isMutedState());

  const handleSoundToggle = () => {
    audioManager.toggleMute();
    setSoundMuted(audioManager.isMutedState());
    
    // Если звук включен, запускаем фоновую музыку
    if (!audioManager.isMutedState()) {
      audioManager.playAmbientLoop();
    }
  };

  // Запускаем фоновую музыку при загрузке, если звук не отключен
  useEffect(() => {
    if (!audioManager.isMutedState()) {
      audioManager.playAmbientLoop();
    }
  }, []);

  return (
    <>
      <GameHUD
        health={gameState.health}
        ammo={gameState.ammo}
        coins={gameState.coins}
        level={gameState.level}
        soundMuted={soundMuted}
        onPause={onPause}
        onSoundToggle={handleSoundToggle}
      />
    </>
  );
};

export default MolaMolaHUDWrapper;
