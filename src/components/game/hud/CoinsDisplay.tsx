
import React from "react";
import { Coins } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface CoinsDisplayProps {
  coins: number;
}

const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ coins }) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <span className="flex items-center font-semibold text-yellow-300 whitespace-nowrap text-sm">
      <Coins size={16} className="mr-1" />
      <span className="hidden sm:inline">{t.coins}:</span>
      <span className="ml-1">{coins}</span>
    </span>
  );
};

export default CoinsDisplay;
