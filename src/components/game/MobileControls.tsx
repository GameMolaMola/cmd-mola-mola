
import React from "react";

interface MobileControlsProps {
  onControl: (control: "left" | "right" | "jump" | "fire", state: boolean) => void;
}
const BUTTONS = [
  { control: "left", label: "◀️" },
  { control: "jump", label: "⬆️" },
  { control: "right", label: "▶️" },
  { control: "fire", label: "🔥" },
];

export default function MobileControls({ onControl }: MobileControlsProps) {
  return (
    <div className="absolute z-20 left-0 right-0 bottom-0 flex justify-between px-2 pb-2 pointer-events-none">
      {/* Левая панель */}
      <div className="flex gap-2 pointer-events-auto">
        {/* Кнопки влево/вправо */}
        <button
          className="rounded-full bg-black/70 text-white w-14 h-14 text-3xl flex items-center justify-center border-2 border-cyan-400 active:bg-cyan-700 transition-all touch-manipulation"
          style={{ touchAction: "none" }}
          onTouchStart={e => { e.preventDefault(); onControl("left", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("left", false); }}
          onMouseDown={() => onControl("left", true)}
          onMouseUp={() => onControl("left", false)}
        >
          ◀️
        </button>
        <button
          className="rounded-full bg-black/70 text-white w-14 h-14 text-3xl flex items-center justify-center border-2 border-yellow-400 active:bg-yellow-700 transition-all touch-manipulation"
          style={{ touchAction: "none" }}
          onTouchStart={e => { e.preventDefault(); onControl("right", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("right", false); }}
          onMouseDown={() => onControl("right", true)}
          onMouseUp={() => onControl("right", false)}
        >
          ▶️
        </button>
      </div>
      {/* Правая панель */}
      <div className="flex gap-2 pointer-events-auto">
        {/* Прыжок */}
        <button 
          className="rounded-full bg-black/70 text-yellow-200 w-14 h-14 text-3xl flex items-center justify-center border-2 border-yellow-400 active:bg-cyan-700 transition-all touch-manipulation"
          style={{ touchAction: "none" }}
          onTouchStart={e => { e.preventDefault(); onControl("jump", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("jump", false); }}
          onMouseDown={() => onControl("jump", true)}
          onMouseUp={() => onControl("jump", false)}
        >
          ⬆️
        </button>
        {/* Огонь */}
        <button
          className="rounded-full bg-black/70 text-red-400 w-14 h-14 text-3xl flex items-center justify-center border-2 border-red-400 active:bg-yellow-700 transition-all touch-manipulation"
          style={{ touchAction: "none" }}
          onTouchStart={e => { e.preventDefault(); onControl("fire", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("fire", false); }}
          onMouseDown={() => onControl("fire", true)}
          onMouseUp={() => onControl("fire", false)}
        >
          🔥
        </button>
      </div>
    </div>
  );
}
