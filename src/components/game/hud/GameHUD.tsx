
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

// Не кэшируем язык
const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile, language,
}) => {
  // Для проверки, что доходит нужный язык
  console.log('HUD GameHUD язык:', language);

  const finalScore = typeof score === "number" ? score : coins * 10 + level * 100;

  return (
    <div className="w-full flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <HealthDisplay health={health} language={language} />
        <CoinsDisplay coins={coins} language={language} />
        <AmmoDisplay ammo={ammo} language={language} />
        <LevelDisplay level={level} language={language} />
        <ScoreDisplay score={finalScore} language={language} />
      </div>
      {isMobile && onPause && (
        <PauseButton onPause={onPause} language={language} />
      )}
    </div>
  );
};

export default GameHUD;
