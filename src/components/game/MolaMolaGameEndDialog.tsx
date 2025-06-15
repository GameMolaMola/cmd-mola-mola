
import React from "react";
import GameOverDialog from "./hud/GameOverDialog";

interface Props {
  open: boolean;
  victory: boolean;
  stats: { level: number; coins: number };
  onRestart: () => void;
}

const MolaMolaGameEndDialog: React.FC<Props> = ({
  open, victory, stats, onRestart
}) => (
  <GameOverDialog
    open={open}
    victory={victory}
    stats={stats}
    onRestart={onRestart}
  />
);

export default MolaMolaGameEndDialog;
