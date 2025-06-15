import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface PauseButtonProps {
  onPause: () => void;
  // language?: Language;
}

const PauseButton: React.FC<PauseButtonProps> = ({ onPause }) => {
  const { language } = useGame();
  const t = useTranslations(language);
  console.log('HUD PauseButton реальный язык:', language);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-2"
      onClick={onPause}
    >
      {t.pause}
    </Button>
  );
};

export default PauseButton;
