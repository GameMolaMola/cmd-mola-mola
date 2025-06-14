
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Language } from "@/contexts/GameContext";

interface ScoreDisplayProps {
  score: number;
  language: Language;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, language }) => {
  const t = useTranslations(language);
  return (
    <span className="flex items-center font-semibold text-cyan-400 whitespace-nowrap">
      {t.score}: {score}
    </span>
  );
};

export default ScoreDisplay;
