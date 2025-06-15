
import React from "react";
import HealthDisplay from "./HealthDisplay";
import CoinsDisplay from "./CoinsDisplay";
import AmmoDisplay from "./AmmoDisplay";
import PauseButton from "./PauseButton";
import LevelDisplay from "./LevelDisplay";
import { useGame } from "@/contexts/GameContext";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  onPause?: () => void;
  isMobile?: boolean;
}

const HUD_WRAPPER_CLASS = `
  w-full max-w-full 
  flex items-center justify-between
  box-border p-1 gap-1 text-xs
  sm:px-4 sm:py-2 sm:gap-4 sm:text-base
  pointer-events-none z-30
  absolute top-0 left-0
`;

const HUD_INFO_CLASS = `
  flex items-center gap-1 flex-nowrap
  sm:gap-4
  min-w-0 w-full max-w-[100vw]
  overflow-x-auto
  pointer-events-auto
  bg-black/45 rounded-br-lg px-2 py-1
`;

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, onPause, isMobile
}) => {
  const { language } = useGame();

  return (
    <div className={HUD_WRAPPER_CLASS}>
      <div className={HUD_INFO_CLASS}>
        <HealthDisplay health={health} />
        <CoinsDisplay coins={coins} />
        <AmmoDisplay ammo={ammo} />
        <LevelDisplay level={level} />
      </div>
      {isMobile && onPause && (
        <div className="pointer-events-auto">
          <PauseButton onPause={onPause} />
        </div>
      )}
    </div>
  );
};

export default GameHUD;
