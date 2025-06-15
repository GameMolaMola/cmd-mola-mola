
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface AmmoDisplayProps {
  ammo: number;
}

const AmmoDisplay: React.FC<AmmoDisplayProps> = ({ ammo }) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <span className="flex items-center font-semibold text-pink-100 whitespace-nowrap text-sm">
      <span role="img" aria-label="ammo" className="mr-1">🔫</span>
      <span className="hidden sm:inline">{t.ammo}:</span>
      <span className="ml-1">{ammo}</span>
    </span>
  );
};

export default AmmoDisplay;
