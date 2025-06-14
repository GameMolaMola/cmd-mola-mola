
import React from "react";
import { Coins } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface CoinsDisplayProps {
  coins: number;
  // language?: Language;
}

const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ coins }) => {
  const { language } = useGame();
  const t = useTranslations(language);
  console.log('HUD CoinsDisplay реальный язык:', language);

  return (
    <span className="flex items-center font-semibold text-yellow-300 whitespace-nowrap">
      <Coins size={18} className="mr-1" />
      {t.coins}: {coins}
    </span>
  );
};

export default CoinsDisplay;
