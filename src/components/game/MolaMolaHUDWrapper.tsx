
import React from "react";
import GameHUD from "./hud/GameHUD";
import PauseOverlay from "./PauseOverlay";
// import { Language } from "@/contexts/GameContext";

interface Props {
  hud: { health: number; ammo: number; coins: number; level: number; score: number };
  isMobile: boolean;
  isPaused: boolean;
  onPause: () => void;
  // language: Language;
}

const MolaMolaHUDWrapper: React.FC<Props> = ({ hud, isMobile, isPaused, onPause }) => {
  // HUD language controlled by context
  return (
    <>
      <GameHUD
        health={hud.health}
        ammo={hud.ammo}
        coins={hud.coins}
        level={hud.level}
        score={hud.score}
        onPause={onPause}
        isMobile={isMobile}
        language={undefined as any}
      />
      <PauseOverlay visible={isPaused} />
    </>
  );
};

export default MolaMolaHUDWrapper;
