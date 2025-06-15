
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface LevelDisplayProps {
  level: number;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ level }) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <span className="flex items-center font-semibold text-cyan-300 whitespace-nowrap text-sm">
      <span role="img" aria-label="level" className="mr-1">🎯</span>
      <span className="hidden sm:inline">{t.level}:</span>
      <span className="ml-1">{level}</span>
    </span>
  );
};

export default LevelDisplay;
