
import React from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Language } from "@/contexts/GameContext";

interface HealthDisplayProps {
  health: number;
  language: Language;
}

const HealthDisplay: React.FC<HealthDisplayProps> = ({ health, language }) => {
  const t = useTranslations(language);
  return (
    <span className="flex items-center font-semibold text-white whitespace-nowrap">
      <Heart size={18} className="mr-1 text-red-400" />
      {t.health}: {health}
    </span>
  );
};

export default HealthDisplay;
