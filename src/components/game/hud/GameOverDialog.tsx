
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GameOverDialogProps {
  open: boolean;
  victory: boolean;
  stats: { level: number; coins: number; score: number };
  onRestart: () => void;
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  victory,
  stats,
  onRestart,
}) => (
  <Dialog open={open}>
    <DialogContent className="flex flex-col items-center gap-3 max-w-md">
      <div className={`text-2xl font-bold text-center mb-2 ${victory ? "text-green-400" : "text-red-400"}`}>
        {victory ? "🎉 Победа! 🎉" : "Игра окончена"}
      </div>
      <div className="flex flex-col gap-1 text-yellow-100 text-lg">
        <span>Уровень: {stats.level}</span>
        <span>Очки: {stats.score}</span>
        <span>Монеты: {stats.coins}</span>
      </div>
      <Button onClick={onRestart} className="bg-yellow-500 text-black hover:bg-yellow-600 shadow mt-3 px-8">
        Играть снова
      </Button>
    </DialogContent>
  </Dialog>
);

export default GameOverDialog;
