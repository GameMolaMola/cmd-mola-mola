
import React from "react";
import HealthDisplay from "./HealthDisplay";
import CoinsDisplay from "./CoinsDisplay";
import AmmoDisplay from "./AmmoDisplay";
import ScoreDisplay from "./ScoreDisplay";
import PauseButton from "./PauseButton";
import LevelDisplay from "./LevelDisplay";
import { Language } from "@/contexts/GameContext";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  score?: number;
  onPause?: () => void;
  isMobile?: boolean;
  language: Language;
}

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile, language,
}) => {
  console.log('HUD GameHUD язык:', language);

  const finalScore = typeof score === "number" ? score : coins * 10 + level * 100;

  return (
    <div className="w-full flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <HealthDisplay health={health} />
        <CoinsDisplay coins={coins} />
        <AmmoDisplay ammo={ammo} />
        <LevelDisplay level={level} />
        <ScoreDisplay score={finalScore} />
      </div>
      {isMobile && onPause && (
        <PauseButton onPause={onPause} language={language} />
      )}
    </div>
  );
};

export default GameHUD;
