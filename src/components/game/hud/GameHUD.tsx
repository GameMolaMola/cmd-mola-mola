
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Coins } from "lucide-react";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  score?: number;
  onPause?: () => void;
  isMobile?: boolean;
}

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile
}) => {
  return (
    <div className="w-full flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center font-semibold text-white whitespace-nowrap">
          <Heart size={18} className="mr-1 text-red-400" />
          {health}
        </span>
        <span className="flex items-center font-semibold text-yellow-300 whitespace-nowrap">
          <Coins size={18} className="mr-1" />
          {coins}
        </span>
        <span className="flex items-center font-semibold text-pink-100 whitespace-nowrap">
          <span role="img" aria-label="ammo" className="mr-1">🔫</span>
          {ammo}
        </span>
        <span className="flex items-center font-semibold text-blue-200 whitespace-nowrap">
          Уровень: {level}
        </span>
        <span className="flex items-center font-semibold text-cyan-400 whitespace-nowrap">
          Очки: {score ?? (coins * 10 + level * 100)}
        </span>
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
