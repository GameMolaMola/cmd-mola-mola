
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame } from "@/contexts/GameContext";

interface GameOverDialogProps {
  open: boolean;
  victory: boolean;
  stats: { level: number; coins: number };
  onRestart: () => void;
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  victory,
  stats,
  onRestart
}) => {
  const { language } = useGame();
  const t = useTranslations(language);
  return (
    <Dialog open={open}>
      <div 
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          pointerEvents: open ? "auto" : "none",
          background: "rgba(11,23,61,0.78)",
          display: open ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DialogContent className="flex flex-col items-center gap-3 max-w-md bg-gradient-to-b from-blue-900/90 to-black/90 border-2 border-yellow-500 shadow-2xl py-6 px-3"
          style={{
            zIndex: 2100,
            pointerEvents: "auto"
          }}>
          <div className={`text-3xl font-bold text-center mb-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] ${victory ? "text-green-300" : "text-yellow-400"}`}>
            {victory ? (
              <span className="drop-shadow-glow">{t.victory}</span>
            ) : (
              <span className="drop-shadow-glow">{t.gameOver}</span>
            )}
          </div>
          <div className="flex flex-col gap-1 text-yellow-200 text-xl font-semibold bg-black/40 rounded p-4 shadow-inner w-full max-w-xs">
            <span>{t.level}: <span className="font-mono">{stats.level}</span></span>
            <span>{t.coins}: <span className="font-mono">{stats.coins}</span></span>
          </div>
          <Button
            onClick={onRestart}
            className="bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg mt-5 px-10 py-3 font-bold rounded-lg hover-scale transition"
            autoFocus
            data-testid="gioca-ancora"
          >
            {t.playAgain}
          </Button>
        </DialogContent>
        <style>
          {`.drop-shadow-glow {text-shadow:0 0 14px #fff, 0 0 3px #fed700,0 2px 8px #000;}`}
        </style>
      </div>
    </Dialog>
  );
};

export default GameOverDialog;
