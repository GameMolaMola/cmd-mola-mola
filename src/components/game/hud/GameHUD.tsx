
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Coins } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useGame, Language } from "@/contexts/GameContext";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  score?: number;
  onPause?: () => void;
  isMobile?: boolean;
  language?: Language;
}

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile, language
}) => {
  const context = useGame();
  const lang: Language = language ?? context.language;
  const t = useTranslations(lang);

  return (
    <div className="w-full flex items-center justify-between p-2 md:p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center font-semibold text-white whitespace-nowrap">
          <Heart size={18} className="mr-1 text-red-400" />
          {t.health}: {health}
        </span>
        <span className="flex items-center font-semibold text-yellow-300 whitespace-nowrap">
          <Coins size={18} className="mr-1" />
          {t.coins}: {coins}
        </span>
        <span className="flex items-center font-semibold text-pink-100 whitespace-nowrap">
          <span role="img" aria-label="ammo" className="mr-1">🔫</span>
          {t.ammo}: {ammo}
        </span>
        <span className="flex items-center font-semibold text-cyan-400 whitespace-nowrap">
          {t.score}: {score ?? (coins * 10 + level * 100)}
        </span>
      </div>
      {isMobile && onPause && (
        <Button
          variant="secondary"
          size="sm"
          className="ml-2"
          onClick={onPause}
        >
          {t && t.pause ? t.pause : "Пауза"}
        </Button>
      )}
    </div>
  );
};

export default GameHUD;
