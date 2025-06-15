
import React from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface HealthDisplayProps {
  health: number;
}

const HealthDisplay: React.FC<HealthDisplayProps> = ({ health }) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <span className="flex items-center font-semibold text-white whitespace-nowrap text-sm">
      <Heart size={16} className="mr-1 text-red-400" />
      <span className="hidden sm:inline">{t.health}:</span>
      <span className="ml-1">{health}</span>
    </span>
  );
};

export default HealthDisplay;
