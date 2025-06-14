import React from "react";
import { Button } from "@/components/ui/button";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  onPause?: () => void;
  isMobile?: boolean;
}

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, onPause, isMobile
}) => {
  return (
    <div className="w-full flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-white">Здоровье: {health}</span>
        <span className="font-semibold text-yellow-300">Монеты: {coins}</span>
        <span className="font-semibold text-blue-200">Level: {level}</span>
        <span className="font-semibold text-pink-100">Патроны: {ammo}</span>
      </div>
      {isMobile && onPause && (
        <Button
          variant="secondary"
          size="sm"
          className="ml-2"
          onClick={onPause}
        >
          Пауза
        </Button>
      )}
    </div>
  );
};

export default GameHUD;
