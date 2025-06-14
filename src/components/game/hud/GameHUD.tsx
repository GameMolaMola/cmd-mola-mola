import React from "react";
import { useGame, Language } from "@/contexts/GameContext";
import HealthDisplay from "./HealthDisplay";
import CoinsDisplay from "./CoinsDisplay";
import AmmoDisplay from "./AmmoDisplay";
import ScoreDisplay from "./ScoreDisplay";
import PauseButton from "./PauseButton";
import LevelDisplay from "./LevelDisplay";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  score?: number;
  onPause?: () => void;
  isMobile?: boolean;
  language?: Language;
}

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile, language,
}) => {
  // Здесь убираем работу с context! Используем только переданный проп языка.
  const lang: Language = language;
  const finalScore = typeof score === "number" ? score : coins * 10 + level * 100;

  return (
    <div className="w-full flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <HealthDisplay health={health} language={lang} />
        <CoinsDisplay coins={coins} language={lang} />
        <AmmoDisplay ammo={ammo} language={lang} />
        <LevelDisplay level={level} language={lang} />
        <ScoreDisplay score={finalScore} language={lang} />
      </div>
      {isMobile && onPause && (
        <PauseButton onPause={onPause} language={lang} />
      )}
    </div>
  );
};

export default GameHUD;
