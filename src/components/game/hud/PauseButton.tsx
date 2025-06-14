
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { Language } from "@/contexts/GameContext";

interface PauseButtonProps {
  onPause: () => void;
  language: Language;
}

const PauseButton: React.FC<PauseButtonProps> = ({ onPause, language }) => {
  const t = useTranslations(language);
  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-2"
      onClick={onPause}
    >
      {t && t.pause ? t.pause : "Пауза"}
    </Button>
  );
};

export default PauseButton;
