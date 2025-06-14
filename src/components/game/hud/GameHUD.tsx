
import React from "react";

interface GameHUDProps {
  health: number;
  ammo: number;
  coins: number;
  level: number;
}

const coinImgSrc = "/lovable-uploads/d2252a4a-1b92-4f67-9f8b-92c0da5dbfaa.png";

const GameHUD: React.FC<GameHUDProps> = ({ health, ammo, coins, level }) => (
  <div className="flex justify-between items-center w-full px-4 py-2 bg-black/50 rounded-lg mb-2 text-yellow-100 select-none shadow-md">
    <div className="flex items-center gap-3">
      {/* Жизни и монеты теперь идут рядом */}
      <span className="font-bold flex items-center gap-2">
        <span className="flex items-center gap-2">
          <span>❤️ {health}</span>
          <span className="flex items-center gap-1">
            <img
              src={coinImgSrc}
              alt="Coin"
              className="h-6 w-6 rounded-full bg-yellow-200 border border-yellow-400 shadow"
              style={{ objectFit: "cover", verticalAlign: "middle" }}
            />
            <span className="ml-0.5">{coins}</span>
          </span>
        </span>
      </span>
      <span className="font-bold">🔫 {ammo}</span>
    </div>
    <div className="font-bold">LVL {level}</div>
  </div>
);

export default GameHUD;

