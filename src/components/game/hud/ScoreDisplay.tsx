
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface ScoreDisplayProps {
  score: number;
  // language?: Language;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const { language } = useGame();
  const t = useTranslations(language);
  console.log('HUD ScoreDisplay реальный язык:', language);

  return (
    <span className="flex items-center font-semibold text-cyan-400 whitespace-nowrap">
      {t.score}: {score}
    </span>
  );
};

export default ScoreDisplay;
