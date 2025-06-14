
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface LevelDisplayProps {
  level: number;
  // language?: Language;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level }) => {
  const { language } = useGame();
  const t = useTranslations(language);
  console.log('HUD LevelDisplay реальный язык:', language);

  return (
    <span className="flex items-center font-semibold text-cyan-300 whitespace-nowrap">
      <span role="img" aria-label="level" className="mr-1">🎯</span>
      {t.level}: <span className="ml-1">{level}</span>
    </span>
  );
};

export default LevelDisplay;
