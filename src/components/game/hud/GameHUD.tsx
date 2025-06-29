
import React from 'react';
import HealthDisplay from './HealthDisplay';
import AmmoDisplay from './AmmoDisplay';
import CoinsDisplay from './CoinsDisplay';
import LevelDisplay from './LevelDisplay';
import PauseButton from './PauseButton';
import SoundToggle from './SoundToggle';

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  soundMuted?: boolean;
  onPause: () => void;
  onSoundToggle?: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ 
  health, 
  ammo, 
  coins, 
  level, 
  soundMuted = false,
  onPause,
  onSoundToggle
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 bg-black/70 px-3 py-2 rounded-lg border border-cyan-400">
          <HealthDisplay health={health} />
          <AmmoDisplay ammo={ammo} />
          <CoinsDisplay coins={coins} />
          <LevelDisplay level={level} />
        </div>
        <div className="flex items-center space-x-2">
          {onSoundToggle && (
            <SoundToggle 
              isMuted={soundMuted} 
              onToggle={onSoundToggle} 
            />
          )}
          <PauseButton onPause={onPause} />
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
