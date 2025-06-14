
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

const pos = "absolute top-4 right-5 z-30";
const style = "bg-black/80 px-4 py-2 rounded-full shadow-lg border-2 border-yellow-400 text-cyan-300 text-lg font-semibold tracking-wide flex items-center select-none";

interface LevelIndicatorProps {
  level: number;
  language?: string;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, language }) => {
  const { language: ctxLang } = useGame();
  const lang = language || ctxLang;
  const t = useTranslations(lang);
  return (
    <div className={`${pos} ${style}`}>
      {t.level}: <span className="ml-2 font-mono">{level}</span>
    </div>
  );
};

export default LevelIndicator;
