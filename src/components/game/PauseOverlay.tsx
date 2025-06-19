import React from "react";
import { useGame } from "@/contexts/GameContext";
import { useTranslations } from "@/hooks/useTranslations";

interface PauseOverlayProps {
  visible: boolean;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ visible }) => {
  const { language } = useGame();
  const t = useTranslations(language);

  if (!visible) return null;
  return (
    <div className="absolute inset-0 bg-black bg-opacity-55 flex flex-col items-center justify-center z-50 animate-fade-in">
      <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">{t.pause}</span>
      <span className="text-lg text-white opacity-90">
        {t.continueHintBefore}
        <span className="font-semibold px-2 py-1 mx-1 rounded bg-white/20 border border-white/30">P</span>
        {t.continueHintAfter}
      </span>
    </div>
  );
};

export default PauseOverlay;
