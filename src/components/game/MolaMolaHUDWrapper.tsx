
import React from "react";
import GameHUD from "./hud/GameHUD";

interface Props {
  hud: { health: number; ammo: number; coins: number; level: number };
  isMobile: boolean;
  onPause: () => void;
}

const MolaMolaHUDWrapper: React.FC<Props> = ({ hud, isMobile, onPause }) => {
  return (
    <GameHUD
      health={hud.health}
      ammo={hud.ammo}
      coins={hud.coins}
      level={hud.level}
      onPause={onPause}
      isMobile={isMobile}
    />
  );
};

export default MolaMolaHUDWrapper;
