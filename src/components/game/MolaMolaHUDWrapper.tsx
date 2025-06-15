import React, { useState, useEffect } from 'react';
import GameHUD from './hud/GameHUD';
import PauseMenu from './PauseMenu';

interface MolaMolaHUDWrapperProps {
  engine: any;
  onGameEnd: (victory: boolean, finalStats: any) => void;
}

const MolaMolaHUDWrapper: React.FC<MolaMolaHUDWrapperProps> = ({ engine, onGameEnd }) => {
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(20);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState({
    health: 100,
    ammo: 20,
    coins: 0,
    level: 1,
    soundMuted: false,
  });

  useEffect(() => {
    if (engine) {
      engine.callbacks.onStateUpdate = (updates: any) => {
        setGameState(prevState => ({
          ...prevState,
          health: updates.health !== undefined ? updates.health : prevState.health,
          ammo: updates.ammo !== undefined ? updates.ammo : prevState.ammo,
          coins: updates.coins !== undefined ? updates.coins : prevState.coins,
          level: updates.level !== undefined ? updates.level : prevState.level,
          soundMuted: updates.soundMuted !== undefined ? updates.soundMuted : prevState.soundMuted,
        }));
        setHealth(updates.health !== undefined ? updates.health : health);
        setAmmo(updates.ammo !== undefined ? updates.ammo : ammo);
        setCoins(updates.coins !== undefined ? updates.coins : coins);
        setLevel(updates.level !== undefined ? updates.level : level);
      };
    }
  }, [engine, health, ammo, coins, level]);

  const onPause = () => {
    setIsPaused(!isPaused);
    if (engine) {
      if (isPaused) {
        engine.start();
      } else {
        engine.stop();
      }
    }
  };

  return (
    <>
      <GameHUD
        health={health}
        ammo={ammo}
        coins={coins}
        level={level}
        soundMuted={gameState.soundMuted}
        onPause={onPause}
        onSoundToggle={engine?.toggleSound}
      />
      {isPaused && <PauseMenu onResume={onPause} onGameEnd={onGameEnd} />}
    </>
  );
};

export default MolaMolaHUDWrapper;
