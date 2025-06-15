
import React, { useState, useEffect } from 'react';
import GameHUD from './hud/GameHUD';
import { GameState } from './types';

interface MolaMolaHUDWrapperProps {
  hud: GameState;
  isMobile: boolean;
  onPause: () => void;
}

const MolaMolaHUDWrapper: React.FC<MolaMolaHUDWrapperProps> = ({ hud, isMobile, onPause }) => {
  return (
    <>
      <GameHUD
        health={hud.health}
        ammo={hud.ammo}
        coins={hud.coins}
        level={hud.level}
        soundMuted={hud.soundMuted}
        onPause={onPause}
        onSoundToggle={() => {
          // Sound toggle functionality will be handled by the audio manager
          console.log('Sound toggle clicked');
        }}
      />
    </>
  );
};

export default MolaMolaHUDWrapper;
