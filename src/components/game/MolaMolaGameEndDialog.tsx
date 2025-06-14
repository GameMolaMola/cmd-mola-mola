
import React from "react";
import GameOverDialog from "./hud/GameOverDialog";
import { Language } from "@/contexts/GameContext";

interface Props {
  open: boolean;
  victory: boolean;
  stats: { level: number; coins: number; score: number };
  onRestart: () => void;
  language: Language;
}

const MolaMolaGameEndDialog: React.FC<Props> = ({
  open, victory, stats, onRestart, language
}) => (
  <GameOverDialog
    open={open}
    victory={victory}
    stats={stats}
    onRestart={onRestart}
    language={language}
  />
);

export default MolaMolaGameEndDialog;

