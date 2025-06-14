
import React from "react";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ health, ammo, coins, level }) => (
  <div className="flex justify-between items-center w-full px-4 py-2 bg-black/50 rounded-lg mb-2 text-yellow-100 select-none">
    <div className="flex items-center gap-3">
      {/* Жизни и монеты теперь идут рядом */}
      <span className="font-bold flex items-center gap-2">
        <span>❤️ {health}</span>
        <span>🧀 {coins}</span>
      </span>
      <span className="font-bold">🔫 {ammo}</span>
    </div>
    <div className="font-bold">LVL {level}</div>
  </div>
);

export default GameHUD;

