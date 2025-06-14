
import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Language } from "@/contexts/GameContext";

interface AmmoDisplayProps {
  ammo: number;
  language: Language;
}

const AmmoDisplay: React.FC<AmmoDisplayProps> = ({ ammo, language }) => {
  const t = useTranslations(language);
  return (
    <span className="flex items-center font-semibold text-pink-100 whitespace-nowrap">
      <span role="img" aria-label="ammo" className="mr-1">🔫</span>
      {t.ammo}: {ammo}
    </span>
  );
};

export default AmmoDisplay;
