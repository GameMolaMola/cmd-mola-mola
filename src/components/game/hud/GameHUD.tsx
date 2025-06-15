
import React from "react";
import HealthDisplay from "./HealthDisplay";
import CoinsDisplay from "./CoinsDisplay";
import AmmoDisplay from "./AmmoDisplay";
import ScoreDisplay from "./ScoreDisplay";
import PauseButton from "./PauseButton";
import LevelDisplay from "./LevelDisplay";
import { useGame } from "@/contexts/GameContext";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
  score?: number;
  onPause?: () => void;
  isMobile?: boolean;
}

// Новый класс для HUD чтобы он не выходил за края экрана, всегда внутри safe area:
const HUD_WRAPPER_CLASS = `
  w-full max-w-full 
  flex items-center justify-between
  box-border p-1 gap-1 text-xs
  sm:px-4 sm:py-2 sm:gap-4 sm:text-base
  pointer-events-none z-30
  absolute top-0 left-0
`;

// Секция с иконками и цифрами всегда должна влезать даже на маленьких экранах:
const HUD_INFO_CLASS = `
  flex items-center gap-1 flex-nowrap
  sm:gap-4
  min-w-0 w-full max-w-[100vw]
  overflow-x-auto
  pointer-events-auto
  bg-black/45 rounded-br-lg px-2 py-1
`;

const GameHUD: React.FC<GameHUDProps> = ({
  health, ammo, coins, level, score, onPause, isMobile
}) => {
  const { language } = useGame();
  // console.log('HUD GameHUD язык:', language);

  const finalScore = typeof score === "number" ? score : coins * 10 + level * 100;

  return (
    <div className={HUD_WRAPPER_CLASS}>
      <div className={HUD_INFO_CLASS}>
        <HealthDisplay health={health} />
        <CoinsDisplay coins={coins} />
        <AmmoDisplay ammo={ammo} />
        <LevelDisplay level={level} />
        <ScoreDisplay score={finalScore} />
      </div>
      {isMobile && onPause && (
        <div className="pointer-events-auto">
          <PauseButton onPause={onPause} />
        </div>
      )}
    </div>
  );
};

export default GameHUD;
