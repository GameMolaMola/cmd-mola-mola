
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface AmmoDisplayProps {
  ammo: number;
  // language?: Language;
}

const AmmoDisplay: React.FC<AmmoDisplayProps> = ({ ammo }) => {
  const { language } = useGame();
  const t = useTranslations(language);
  console.log('HUD AmmoDisplay реальный язык:', language);

  return (
    <span className="flex items-center font-semibold text-pink-100 whitespace-nowrap">
      <span role="img" aria-label="ammo" className="mr-1">🔫</span>
      {t.ammo}: {ammo}
    </span>
  );
};

export default AmmoDisplay;
