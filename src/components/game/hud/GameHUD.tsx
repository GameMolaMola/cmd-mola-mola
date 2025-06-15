
import React from "react";
import HealthDisplay from "./HealthDisplay";
import CoinsDisplay from "./CoinsDisplay";
import AmmoDisplay from "./AmmoDisplay";
import ScoreDisplay from "./ScoreDisplay";
import PauseButton from "./PauseButton";
import LevelDisplay from "./LevelDisplay";
import { useGame } from "@/contexts/GameContext";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  score?: number;
  onPause?: () => void;
  isMobile?: boolean;
}

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile
}) => {
  const { language } = useGame();
  console.log('HUD GameHUD язык:', language);

  const finalScore = typeof score === "number" ? score : coins * 10 + level * 100;

  return (
    <div
      className={`
        w-full flex items-center justify-between
        p-1 gap-1 text-xs
        sm:p-4 sm:gap-4 sm:text-base
      `}
    >
      <div className={`
        flex items-center gap-1 flex-nowrap
        sm:gap-4
      `}>
        <HealthDisplay health={health} />
        <CoinsDisplay coins={coins} />
        <AmmoDisplay ammo={ammo} />
        <LevelDisplay level={level} />
        <ScoreDisplay score={finalScore} />
      </div>
      {isMobile && onPause && (
        <PauseButton onPause={onPause} />
      )}
    </div>
  );
};

export default GameHUD;

